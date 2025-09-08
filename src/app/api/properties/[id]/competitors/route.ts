import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/generated/prisma"

// API Key authentication middleware (for n8n)
function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const expectedToken = process.env.N8N_API_KEY || "pricecip_api_secret_2024"
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }
  
  const token = authHeader.split(" ")[1]
  return token === expectedToken
}

// Session authentication middleware (for dashboard)
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      )
    }

    const { id: propertyId } = await params
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"
    const includeConfig = searchParams.get("include_config") === "true"

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        defaultTimezone: true,
        defaultFrequencyCron: true,
        defaultLookaheadDays: true,
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Get competitors with optional config
    const competitors = await prisma.competitor.findMany({
      where: {
        propertyId: propertyId,
        ...(activeOnly && { active: true })
      },
      include: {
        ...(includeConfig && {
          configs: {
            include: {
              roomType: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  capacity: true,
                }
              }
            }
          }
        }),
        _count: {
          select: {
            configs: true,
            priceHistory: true,
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    })

    // Transform data for n8n consumption
    const transformedCompetitors = competitors.map(competitor => ({
      id: competitor.id,
      name: competitor.name,
      baseUrl: competitor.baseUrl,
      active: competitor.active,
      frequencyCron: competitor.frequencyCron || property.defaultFrequencyCron,
      timezone: competitor.timezone || property.defaultTimezone,
      
      // URLs for different platforms (n8n schema compatibility)
      bookingUrl: competitor.baseUrl.includes("booking.com") ? competitor.baseUrl : null,
      airbnbUrl: competitor.baseUrl.includes("airbnb.com") ? competitor.baseUrl : null,
      directUrl: !competitor.baseUrl.includes("booking.com") && !competitor.baseUrl.includes("airbnb.com") ? competitor.baseUrl : null,
      
      // Scraping configurations if requested
      ...(includeConfig && competitor.configs && {
        configs: competitor.configs.map(config => ({
          id: config.id,
          roomType: 'roomType' in config ? config.roomType : undefined,
          priceSelector: config.priceSelector,
          dateSelector: config.dateSelector,
          currencySelector: config.currencySelector,
          availabilitySelector: config.availabilitySelector,
          notes: config.notes,
        }))
      }),
      
      // Statistics
      configCount: competitor._count.configs,
      priceHistoryCount: competitor._count.priceHistory,
      lastUpdated: competitor.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        name: property.name,
        defaultTimezone: property.defaultTimezone,
        defaultFrequencyCron: property.defaultFrequencyCron,
        defaultLookaheadDays: property.defaultLookaheadDays,
      },
      count: transformedCompetitors.length,
      competitors: transformedCompetitors,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error("Get property competitors error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Create new competitor (Dashboard only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    
    // Validate session for dashboard access
    const authResult = await validateSession(request, propertyId)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const body = await request.json()
    const { name, bookingUrl, notes } = body

    if (!name) {
      return NextResponse.json(
        { error: "Competitor name is required" },
        { status: 400 }
      )
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Create competitor
    const competitor = await prisma.competitor.create({
      data: {
        name,
        baseUrl: bookingUrl || "",
        notes: notes || "",
        propertyId,
        active: true, // Default to active
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
    console.error("Create competitor error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
