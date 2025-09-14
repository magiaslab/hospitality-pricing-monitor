import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { subDays, startOfDay } from "date-fns"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const propertyId = params.id
    const { searchParams } = new URL(request.url)

    // Parametri query
    const days = parseInt(searchParams.get("days") || "7")
    const roomTypeId = searchParams.get("roomTypeId")
    const competitorIds = searchParams.get("competitorIds")?.split(",")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Verifica accesso alla property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        OR: [
          { ownerId: session.user.id },
          { propertyAccesses: { some: { userId: session.user.id } } },
          // Super admin e admin possono vedere tutto
          ...(session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN" ? [{}] : [])
        ]
      }
    })

    if (!property) {
      return NextResponse.json({ error: "Property non trovata o accesso negato" }, { status: 404 })
    }

    // Calcola date range
    let fromDate: Date
    let toDate: Date

    if (startDate && endDate) {
      fromDate = startOfDay(new Date(startDate))
      toDate = startOfDay(new Date(endDate))
    } else {
      toDate = startOfDay(new Date())
      fromDate = startOfDay(subDays(toDate, days))
    }

    // Costruisci filtri
    const whereClause: any = {
      propertyId,
      targetDate: {
        gte: fromDate,
        lte: toDate,
      },
    }

    if (roomTypeId && roomTypeId !== "all") {
      whereClause.roomTypeId = roomTypeId
    }

    if (competitorIds && competitorIds.length > 0) {
      whereClause.competitorId = {
        in: competitorIds
      }
    }

    // Query dati prezzi
    const prices = await prisma.priceHistory.findMany({
      where: whereClause,
      include: {
        competitor: {
          select: {
            id: true,
            name: true,
            active: true,
          }
        },
        roomType: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        }
      },
      orderBy: [
        { targetDate: "asc" },
        { competitor: { name: "asc" } },
        { roomType: { name: "asc" } },
      ]
    })

    // Statistiche aggregate
    const stats = await prisma.priceHistory.aggregate({
      where: whereClause,
      _avg: {
        price: true,
      },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
      _count: {
        _all: true,
      }
    })

    // Statistiche per competitor
    const competitorStats = await prisma.priceHistory.groupBy({
      by: ["competitorId"],
      where: whereClause,
      _avg: {
        price: true,
      },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
      _count: {
        _all: true,
      }
    })

    // Arricchisci statistiche competitor con nomi
    const enrichedCompetitorStats = await Promise.all(
      competitorStats.map(async (stat) => {
        const competitor = await prisma.competitor.findUnique({
          where: { id: stat.competitorId },
          select: { id: true, name: true }
        })
        return {
          ...stat,
          competitor
        }
      })
    )

    // Ultimi aggiornamenti per competitor
    const lastUpdates = await prisma.priceHistory.findMany({
      where: whereClause,
      distinct: ["competitorId"],
      orderBy: {
        fetchedAt: "desc"
      },
      select: {
        competitorId: true,
        fetchedAt: true,
        competitor: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      prices: prices.map(price => ({
        id: price.id,
        targetDate: price.targetDate.toISOString(),
        price: Number(price.price),
        currency: price.currency,
        available: price.available,
        fetchedAt: price.fetchedAt.toISOString(),
        competitor: price.competitor,
        roomType: price.roomType,
        metadata: price.metadata,
        source: price.source
      })),
      stats: {
        totalRecords: stats._count._all,
        averagePrice: stats._avg.price ? Number(stats._avg.price) : 0,
        minPrice: stats._min.price ? Number(stats._min.price) : 0,
        maxPrice: stats._max.price ? Number(stats._max.price) : 0,
        dateRange: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
          days
        }
      },
      competitorStats: enrichedCompetitorStats.map(stat => ({
        competitorId: stat.competitorId,
        competitor: stat.competitor,
        totalRecords: stat._count._all,
        averagePrice: stat._avg.price ? Number(stat._avg.price) : 0,
        minPrice: stat._min.price ? Number(stat._min.price) : 0,
        maxPrice: stat._max.price ? Number(stat._max.price) : 0,
      })),
      lastUpdates: lastUpdates.map(update => ({
        competitorId: update.competitorId,
        competitor: update.competitor,
        lastFetch: update.fetchedAt.toISOString()
      }))
    })

  } catch (error) {
    console.error("Get property prices error:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    // Solo admin possono cancellare dati storici
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Permessi insufficienti" }, { status: 403 })
    }

    const propertyId = params.id
    const { searchParams } = new URL(request.url)

    const competitorId = searchParams.get("competitorId")
    const roomTypeId = searchParams.get("roomTypeId")
    const olderThanDays = parseInt(searchParams.get("olderThanDays") || "0")

    // Costruisci filtri per cancellazione
    const whereClause: any = {
      propertyId,
    }

    if (competitorId) {
      whereClause.competitorId = competitorId
    }

    if (roomTypeId) {
      whereClause.roomTypeId = roomTypeId
    }

    if (olderThanDays > 0) {
      whereClause.fetchedAt = {
        lt: subDays(new Date(), olderThanDays)
      }
    }

    const result = await prisma.priceHistory.deleteMany({
      where: whereClause
    })

    // Log dell'azione
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PRICE_HISTORY_DELETE",
        targetType: "PriceHistory",
        targetId: propertyId,
        metadata: {
          deletedCount: result.count,
          filters: whereClause
        }
      }
    })

    return NextResponse.json({
      message: "Dati storici cancellati con successo",
      deletedCount: result.count
    })

  } catch (error) {
    console.error("Delete price history error:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}