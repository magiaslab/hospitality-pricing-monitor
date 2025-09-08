import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UserRole } from "@/generated/prisma"

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Solo ADMIN e SUPER_ADMIN possono triggare manualmente
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { propertyId, competitorId } = body

    // Trigger n8n workflow manualmente
    const n8nUrl = process.env.N8N_BASE_URL
    const n8nApiKey = process.env.N8N_API_KEY

    if (!n8nUrl || !n8nApiKey) {
      return NextResponse.json({ 
        error: "n8n configuration missing" 
      }, { status: 500 })
    }

    // Trova il workflow ID (dovrebbe essere configurato)
    const workflowId = process.env.N8N_WORKFLOW_ID || "1" // Default workflow ID

    const triggerResponse = await fetch(`${n8nUrl}/api/v1/workflows/${workflowId}/execute`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${n8nApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: {
          propertyId,
          competitorId,
          manualTrigger: true,
          triggeredBy: session.user.email,
          triggeredAt: new Date().toISOString()
        }
      })
    })

    if (!triggerResponse.ok) {
      const error = await triggerResponse.text()
      console.error("n8n trigger failed:", error)
      return NextResponse.json({ 
        error: "Failed to trigger scraping workflow",
        details: error 
      }, { status: 500 })
    }

    const executionData = await triggerResponse.json()

    return NextResponse.json({
      success: true,
      message: "Scraping workflow triggered successfully",
      executionId: executionData.executionId,
      propertyId,
      competitorId,
      triggeredBy: session.user.email,
      triggeredAt: new Date().toISOString()
    })

  } catch (error) {
    console.error("Manual trigger error:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
