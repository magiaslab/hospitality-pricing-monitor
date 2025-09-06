import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createRoomTypeSchema } from "@/lib/validations"
import { canManageProperty } from "@/lib/permissions"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createRoomTypeSchema.parse(body)

    // Verifica permessi sulla property
    const canManage = await canManageProperty(session.user.id, validatedData.propertyId)
    if (!canManage) {
      return NextResponse.json({ error: "Permessi insufficienti" }, { status: 403 })
    }

    // Verifica che la property esista
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property non trovata" },
        { status: 400 }
      )
    }

    const roomType = await prisma.roomType.create({
      data: validatedData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    // Log dell'azione
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ROOM_TYPE_CREATE",
        targetType: "RoomType",
        targetId: roomType.id,
        metadata: {
          roomTypeName: roomType.name,
          propertyId: validatedData.propertyId,
        }
      }
    })

    return NextResponse.json({ roomType }, { status: 201 })
  } catch (error) {
    console.error("Create room type error:", error)
    
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
