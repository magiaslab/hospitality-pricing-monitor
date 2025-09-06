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
  const startTime = Date.now()
  
  try {
    // Validate API key for detailed health info
    const isAuthenticated = validateApiKey(request)
    
    // Basic health check (always available)
    const basicHealth = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    }

    // If not authenticated, return basic info only
    if (!isAuthenticated) {
      return NextResponse.json({
        ...basicHealth,
        authenticated: false,
      })
    }

    // Detailed health checks (authenticated only)
    const [
      dbConnectionTest,
      totalProperties,
      totalCompetitors,
      activeCompetitors,
      totalRoomTypes,
      recentPriceHistory,
      recentScrapeEvents,
      totalUsers,
    ] = await Promise.all([
      // Database connection test
      prisma.$queryRaw`SELECT 1 as test`,
      
      // Properties stats
      prisma.property.count(),
      prisma.competitor.count(),
      prisma.competitor.count({ where: { active: true } }),
      prisma.roomType.count({ where: { active: true } }),
      
      // Recent data stats (last 24 hours)
      prisma.priceHistory.count({
        where: {
          fetchedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Recent scrape events (last 24 hours)
      prisma.scrapeEvent.count({
        where: {
          receivedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Users stats
      prisma.user.count(),
    ])

    // Get recent errors (last 24 hours)
    const recentErrors = await prisma.scrapeEvent.count({
      where: {
        status: "ERROR",
        receivedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })

    // Calculate error rate
    const errorRate = recentScrapeEvents > 0 
      ? (recentErrors / recentScrapeEvents) * 100 
      : 0

    // System health assessment
    const healthScore = calculateHealthScore({
      dbConnected: !!dbConnectionTest,
      errorRate,
      recentActivity: recentPriceHistory > 0,
      activeCompetitors: activeCompetitors > 0,
    })

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      ...basicHealth,
      authenticated: true,
      health: {
        score: healthScore,
        status: healthScore >= 80 ? "healthy" : healthScore >= 60 ? "degraded" : "unhealthy",
        responseTime: `${responseTime}ms`,
      },
      database: {
        connected: !!dbConnectionTest,
        responseTime: `${responseTime}ms`,
      },
      statistics: {
        properties: {
          total: totalProperties,
          withActiveCompetitors: activeCompetitors > 0 ? "yes" : "no",
        },
        competitors: {
          total: totalCompetitors,
          active: activeCompetitors,
          activePercentage: totalCompetitors > 0 ? Math.round((activeCompetitors / totalCompetitors) * 100) : 0,
        },
        roomTypes: {
          active: totalRoomTypes,
        },
        users: {
          total: totalUsers,
        },
        activity: {
          pricesLast24h: recentPriceHistory,
          scrapeEventsLast24h: recentScrapeEvents,
          errorsLast24h: recentErrors,
          errorRate: Math.round(errorRate * 100) / 100,
        },
      },
      lastUpdated: new Date().toISOString(),
    })

  } catch (error) {
    console.error("Health check error:", error)
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Database connection failed or internal error",
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        authenticated: false,
      },
      { status: 500 }
    )
  }
}

// Helper function to calculate overall health score
function calculateHealthScore(metrics: {
  dbConnected: boolean
  errorRate: number
  recentActivity: boolean
  activeCompetitors: boolean
}): number {
  let score = 0
  
  // Database connection (40 points)
  if (metrics.dbConnected) score += 40
  
  // Error rate (30 points)
  if (metrics.errorRate === 0) score += 30
  else if (metrics.errorRate < 5) score += 20
  else if (metrics.errorRate < 15) score += 10
  
  // Recent activity (20 points)
  if (metrics.recentActivity) score += 20
  
  // Active competitors (10 points)
  if (metrics.activeCompetitors) score += 10
  
  return score
}
