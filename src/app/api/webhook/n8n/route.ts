import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { webhookPriceDataSchema } from "@/lib/validations"
import { Prisma } from "@/generated/prisma"

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
      return NextResponse.json({ error: "Webhook secret non valido" }, { status: 401 })
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
        { error: "Property, competitor o room type non trovati" },
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
      metadata: validatedData.metadata as Prisma.InputJsonValue,
      source: validatedData.source,
    }))

    // Batch insert per performance
    const result = await prisma.priceHistory.createMany({
      data: priceHistoryData,
    })

    // Log dell'evento di scraping
    await prisma.scrapeEvent.create({
      data: {
        propertyId: validatedData.propertyId,
        competitorId: validatedData.competitorId,
        status: "SUCCESS",
        message: `Inseriti ${result.count} prezzi`,
        payload: validatedData,
        source: validatedData.source,
      }
    })

    return NextResponse.json({
      message: "Dati ricevuti con successo",
      inserted: result.count,
    })
  } catch (error) {
    console.error("Webhook error:", error)

    // Log dell'errore se abbiamo almeno propertyId
    try {
      const body = await request.json().catch(() => null)
      if (body && typeof body === "object" && body !== null && "propertyId" in body) {
        await prisma.scrapeEvent.create({
          data: {
            propertyId: body.propertyId as string,
            competitorId: (body as Record<string, unknown>).competitorId as string | undefined,
            status: "ERROR",
            message: error instanceof Error ? error.message : "Errore sconosciuto",
            payload: body as Record<string, unknown>,
          }
        }).catch(console.error)
      }
    } catch {
      // Ignore error logging failures
    }
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dati webhook non validi", details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}
