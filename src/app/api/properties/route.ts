import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPropertySchema } from "@/lib/validations"
import { hasRole, getUserProperties } from "@/lib/permissions"
import { UserRole } from "@/generated/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const properties = await getUserProperties(session.user.id)

    return NextResponse.json({ properties })
  } catch (error) {
    console.error("Get properties error:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    // Solo ADMIN e SUPER_ADMIN possono creare properties
    if (!hasRole(session, UserRole.ADMIN)) {
      return NextResponse.json({ error: "Permessi insufficienti" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createPropertySchema.parse(body)

    // Verifica che l'owner esista
    const owner = await prisma.user.findUnique({
      where: { id: validatedData.ownerId }
    })

    if (!owner) {
      return NextResponse.json(
        { error: "Owner non trovato" },
        { status: 400 }
      )
    }

    const property = await prisma.property.create({
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
        action: "PROPERTY_CREATE",
        targetType: "Property",
        targetId: property.id,
        metadata: {
          propertyName: property.name,
          ownerId: property.ownerId,
        }
      }
    })

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error("Create property error:", error)
    
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
