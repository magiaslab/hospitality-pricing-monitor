import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for execution log
const executionLogSchema = z.object({
  workflowId: z.string().min(1, "Workflow ID required"),
  workflowName: z.string().min(1, "Workflow name required"),
  executionId: z.string().min(1, "Execution ID required"),
  status: z.enum(["SUCCESS", "ERROR", "PARTIAL", "TIMEOUT"]),
  startTime: z.string().datetime("Invalid start time"),
  endTime: z.string().datetime("Invalid end time"),
  duration: z.number().min(0, "Duration must be positive"),
  
  // Statistics
  propertiesProcessed: z.number().int().min(0).default(0),
  competitorsProcessed: z.number().int().min(0).default(0),
  pricesScraped: z.number().int().min(0).default(0),
  pricesSaved: z.number().int().min(0).default(0),
  errorsCount: z.number().int().min(0).default(0),
  alertsTriggered: z.number().int().min(0).default(0),
  
  // Details
  processedProperties: z.array(z.string()).optional(),
  errors: z.array(z.object({
    propertyId: z.string().optional(),
    competitorId: z.string().optional(),
    error: z.string(),
    timestamp: z.string().datetime(),
  })).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
  source: z.string().default("n8n-workflow"),
})

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

    // Validate webhook secret if configured
    const webhookSecret = request.headers.get("x-webhook-secret")
    if (process.env.N8N_WEBHOOK_SECRET && webhookSecret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Invalid webhook secret" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = executionLogSchema.parse(body)

    // Create execution log entry
    const executionLog = await prisma.scrapeEvent.create({
      data: {
        // We'll use the first processed property as the main property reference
        propertyId: validatedData.processedProperties?.[0] || "system",
        status: validatedData.status,
        message: `Workflow ${validatedData.workflowName} completed with status: ${validatedData.status}`,
        payload: {
          workflowId: validatedData.workflowId,
          workflowName: validatedData.workflowName,
          executionId: validatedData.executionId,
          startTime: validatedData.startTime,
          endTime: validatedData.endTime,
          duration: validatedData.duration,
          statistics: {
            propertiesProcessed: validatedData.propertiesProcessed,
            competitorsProcessed: validatedData.competitorsProcessed,
            pricesScraped: validatedData.pricesScraped,
            pricesSaved: validatedData.pricesSaved,
            errorsCount: validatedData.errorsCount,
            alertsTriggered: validatedData.alertsTriggered,
          },
          processedProperties: validatedData.processedProperties,
          errors: validatedData.errors,
          metadata: validatedData.metadata,
        },
        source: `${validatedData.source}-${validatedData.workflowId}`,
      }
    })

    // If there were errors, create individual error logs for affected properties
    if (validatedData.errors && validatedData.errors.length > 0) {
      const errorLogs = validatedData.errors
        .filter(error => error.propertyId) // Only log errors with property context
        .map(error => ({
          propertyId: error.propertyId!,
          competitorId: error.competitorId,
          status: "ERROR" as const,
          message: error.error,
          payload: {
            executionId: validatedData.executionId,
            workflowId: validatedData.workflowId,
            timestamp: error.timestamp,
            originalError: error,
          },
          source: `${validatedData.source}-error`,
        }))

      if (errorLogs.length > 0) {
        await prisma.scrapeEvent.createMany({
          data: errorLogs,
          skipDuplicates: true,
        })
      }
    }

    // Calculate success rate for response
    const successRate = validatedData.pricesScraped > 0 
      ? (validatedData.pricesSaved / validatedData.pricesScraped) * 100 
      : 0

    return NextResponse.json({
      success: true,
      message: "Execution log saved successfully",
      logId: executionLog.id,
      statistics: {
        propertiesProcessed: validatedData.propertiesProcessed,
        competitorsProcessed: validatedData.competitorsProcessed,
        pricesScraped: validatedData.pricesScraped,
        pricesSaved: validatedData.pricesSaved,
        successRate: Math.round(successRate * 100) / 100,
        errorsCount: validatedData.errorsCount,
        alertsTriggered: validatedData.alertsTriggered,
        duration: validatedData.duration,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error("Log execution error:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid execution log data",
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
