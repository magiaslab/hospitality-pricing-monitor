"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Database, Activity, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { UserRole } from "@/generated/prisma"

export default function SuperAdminSystemPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  // Solo Super Admin
  if (session.user.role !== UserRole.SUPER_ADMIN) {
    redirect("/dashboard")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema</h1>
          <p className="text-muted-foreground">
            Monitoraggio e configurazione del sistema
          </p>
        </div>
        <Badge className="bg-red-500">
          Super Admin
        </Badge>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              Neon PostgreSQL
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">n8n Workflow</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Attivo</div>
            <p className="text-xs text-muted-foreground">
              n8n.magiaslab.com
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vercel Deploy</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Attivo</div>
            <p className="text-xs text-muted-foreground">
              www.pricecip.it
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Tools */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurazione Sistema
            </CardTitle>
            <CardDescription>
              Impostazioni avanzate del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Database URL:</span>
                <span className="font-mono text-xs">neon://***</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">NextAuth URL:</span>
                <span className="font-mono text-xs">https://www.pricecip.it</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">n8n Base URL:</span>
                <span className="font-mono text-xs">https://n8n.magiaslab.com</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              <Settings className="mr-2 h-4 w-4" />
              Modifica Configurazione (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Strumenti di Emergenza
            </CardTitle>
            <CardDescription>
              Strumenti per gestione emergenze
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Funzionalità in Sviluppo</h3>
              <p className="text-sm text-muted-foreground">
                Gli strumenti di sistema avanzati saranno disponibili nelle prossime versioni.
              </p>
            </div>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                Torna alla Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
