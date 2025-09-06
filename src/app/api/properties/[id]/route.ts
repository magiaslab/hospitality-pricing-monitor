import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updatePropertySchema } from "@/lib/validations"
import { canManageProperty, canViewProperty } from "@/lib/permissions"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const { id: propertyId } = await params

    // Verifica accesso alla property
    const hasAccess = await canViewProperty(session.user.id, propertyId)
    if (!hasAccess) {
      return NextResponse.json({ error: "Accesso negato" }, { status: 403 })
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          }
        },
        roomTypes: {
          orderBy: { name: "asc" }
        },
        competitors: {
          where: { active: true },
          orderBy: { name: "asc" },
          include: {
            configs: {
              include: {
                roomType: true
              }
            }
          }
        },
        _count: {
          select: {
            competitors: true,
            roomTypes: true,
            priceHistory: true,
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json({ error: "Property non trovata" }, { status: 404 })
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error("Get property error:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const { id: propertyId } = await params

    // Verifica permessi di modifica
    const canManage = await canManageProperty(session.user.id, propertyId)
    if (!canManage) {
      return NextResponse.json({ error: "Permessi insufficienti" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updatePropertySchema.parse(body)

    // Se viene cambiato l'owner, verifica che esista
    if (validatedData.ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: validatedData.ownerId }
      })

      if (!owner) {
        return NextResponse.json(
          { error: "Owner non trovato" },
          { status: 400 }
        )
      }
    }

    const property = await prisma.property.update({
      where: { id: propertyId },
      data: validatedData,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          }
        },
        _count: {
          select: {
            competitors: true,
            roomTypes: true,
          }
        }
      }
    })

    // Log dell'azione
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PROPERTY_UPDATE",
        targetType: "Property",
        targetId: property.id,
        metadata: {
          propertyName: property.name,
          changes: validatedData,
        }
      }
    })

    return NextResponse.json({ property })
  } catch (error) {
    console.error("Update property error:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dati non validi", details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const { id: propertyId } = await params

    // Verifica permessi di modifica
    const canManage = await canManageProperty(session.user.id, propertyId)
    if (!canManage) {
      return NextResponse.json({ error: "Permessi insufficienti" }, { status: 403 })
    }

    // Verifica che la property esista
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, name: true }
    })

    if (!property) {
      return NextResponse.json({ error: "Property non trovata" }, { status: 404 })
    }

    // Elimina la property (cascade eliminerà le relazioni)
    await prisma.property.delete({
      where: { id: propertyId }
    })

    // Log dell'azione
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PROPERTY_DELETE",
        targetType: "Property",
        targetId: propertyId,
        metadata: {
          propertyName: property.name,
        }
      }
    })

    return NextResponse.json({ message: "Property eliminata con successo" })
  } catch (error) {
    console.error("Delete property error:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}
