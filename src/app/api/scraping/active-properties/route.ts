import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// API Key authentication middleware
function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const expectedToken = process.env.N8N_API_KEY || "pricecip_api_secret_2024"
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }
  
  const token = authHeader.split(" ")[1]
  return token === expectedToken
}

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "active"
    const scrapingEnabled = searchParams.get("scraping_enabled") === "true"

    // Get active properties with their competitors and room types
    const properties = await prisma.property.findMany({
      where: {
        // Add any filtering logic based on status if needed
        competitors: {
          some: {
            active: true
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        roomTypes: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            code: true,
            capacity: true,
          }
        },
        competitors: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            baseUrl: true,
            frequencyCron: true,
            timezone: true,
            active: true,
          }
        },
        _count: {
          select: {
            competitors: true,
            roomTypes: true,
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    })

    // Transform data for n8n consumption
    const transformedProperties = properties.map(property => ({
      id: property.id,
      name: property.name,
      city: property.city,
      country: property.country,
      propertyType: property.propertyType,
      timezone: property.defaultTimezone || "Europe/Rome",
      frequencyCron: property.defaultFrequencyCron || "0 */2 * * *",
      lookaheadDays: property.defaultLookaheadDays || 30,
      owner: property.owner,
      roomTypes: property.roomTypes,
      competitors: property.competitors,
      competitorCount: property._count.competitors,
      roomTypeCount: property._count.roomTypes,
      scrapingEnabled: property.competitors.length > 0,
      lastUpdated: property.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      count: transformedProperties.length,
      properties: transformedProperties,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error("Get active properties error:", error)
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
