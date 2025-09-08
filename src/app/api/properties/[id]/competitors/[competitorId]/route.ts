import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/generated/prisma"

// Session authentication middleware
async function validateSession(request: NextRequest, propertyId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }

  // Super Admin and Admin can access all properties
  if (session.user.role === UserRole.SUPER_ADMIN || session.user.role === UserRole.ADMIN) {
    return { user: session.user }
  }

  // Property owners can only access their properties
  if (session.user.role === UserRole.OWNER) {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: session.user.id
      }
    })
    
    if (!property) {
      return { error: "Property not found or access denied", status: 404 }
    }
  }

  return { user: session.user }
}

// Update competitor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; competitorId: string }> }
) {
  try {
    const { id: propertyId, competitorId } = await params
    
    // Validate session
    const authResult = await validateSession(request, propertyId)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const body = await request.json()
    const { name, bookingUrl, notes, isActive } = body

    // Verify competitor exists and belongs to property
    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        id: competitorId,
        propertyId: propertyId
      }
    })

    if (!existingCompetitor) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      )
    }

    // Update competitor
    const competitor = await prisma.competitor.update({
      where: { id: competitorId },
      data: {
        ...(name !== undefined && { name }),
        ...(bookingUrl !== undefined && { baseUrl: bookingUrl }),
        ...(notes !== undefined && { notes }),
        ...(isActive !== undefined && { active: isActive }),
      }
    })

    return NextResponse.json({
      success: true,
      competitor: {
        id: competitor.id,
        name: competitor.name,
        bookingUrl: competitor.baseUrl,
        notes: competitor.notes,
        isActive: competitor.active,
      }
    })

  } catch (error) {
    console.error("Update competitor error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Delete competitor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; competitorId: string }> }
) {
  try {
    const { id: propertyId, competitorId } = await params
    
    // Validate session
    const authResult = await validateSession(request, propertyId)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    // Verify competitor exists and belongs to property
    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        id: competitorId,
        propertyId: propertyId
      }
    })

    if (!existingCompetitor) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      )
    }

    // Delete competitor (this will cascade delete related records)
    await prisma.competitor.delete({
      where: { id: competitorId }
    })

    return NextResponse.json({
      success: true,
      message: "Competitor deleted successfully"
    })

  } catch (error) {
    console.error("Delete competitor error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
