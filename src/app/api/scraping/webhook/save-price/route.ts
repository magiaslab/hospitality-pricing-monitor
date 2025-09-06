// Alias per compatibilità con n8n workflow
// Redirige al webhook principale mantenendo la stessa logica

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { webhookPriceDataSchema } from "@/lib/validations"

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

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      )
    }

    // Verifica webhook secret se configurato
    const webhookSecret = request.headers.get("x-webhook-secret")
    if (process.env.N8N_WEBHOOK_SECRET && webhookSecret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = webhookPriceDataSchema.parse(body)

    // Verifica che property, competitor e room type esistano
    const [property, competitor, roomType] = await Promise.all([
      prisma.property.findUnique({ where: { id: validatedData.propertyId } }),
      prisma.competitor.findUnique({ where: { id: validatedData.competitorId } }),
      prisma.roomType.findUnique({ where: { id: validatedData.roomTypeId } }),
    ])

    if (!property || !competitor || !roomType) {
      return NextResponse.json(
        { 
          success: false,
          error: "Property, competitor or room type not found",
          details: {
            propertyFound: !!property,
            competitorFound: !!competitor,
            roomTypeFound: !!roomType,
          }
        },
        { status: 400 }
      )
    }

    // Inserisci i dati di prezzo
    const priceHistoryData = validatedData.prices.map(price => ({
      propertyId: validatedData.propertyId,
      competitorId: validatedData.competitorId,
      roomTypeId: validatedData.roomTypeId,
      targetDate: new Date(price.targetDate),
      price: price.price,
      currency: price.currency,
      available: price.available,
      metadata: validatedData.metadata,
      source: validatedData.source,
    }))

    // Batch insert per performance
    const result = await prisma.priceHistory.createMany({
      data: priceHistoryData,
      skipDuplicates: true, // Evita errori su duplicati
    })

    // Log dell'evento di scraping
    await prisma.scrapeEvent.create({
      data: {
        propertyId: validatedData.propertyId,
        competitorId: validatedData.competitorId,
        status: "SUCCESS",
        message: `Saved ${result.count} prices via n8n webhook`,
        payload: validatedData,
        source: validatedData.source || "n8n-webhook",
      }
    })

    // Check for price alerts (simplified logic)
    const alertTriggered = false // TODO: Implement alert logic based on price changes

    return NextResponse.json({
      success: true,
      message: "Price data saved successfully",
      statistics: {
        pricesReceived: validatedData.prices.length,
        pricesSaved: result.count,
        duplicatesSkipped: validatedData.prices.length - result.count,
      },
      property: {
        id: property.id,
        name: property.name,
      },
      competitor: {
        id: competitor.id,
        name: competitor.name,
      },
      roomType: {
        id: roomType.id,
        name: roomType.name,
      },
      alert_triggered: alertTriggered,
      owner_email: null, // TODO: Get from property owner
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error("Save price webhook error:", error)

    // Log dell'errore se abbiamo almeno propertyId
    if (typeof error === "object" && error !== null && "propertyId" in error) {
      await prisma.scrapeEvent.create({
        data: {
          propertyId: (error as any).propertyId,
          competitorId: (error as any).competitorId,
          status: "ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          payload: error,
        }
      }).catch(console.error)
    }
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid webhook data",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

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
