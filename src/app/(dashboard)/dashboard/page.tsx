"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Users, BarChart3, Plus, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { UserRole } from "@/generated/prisma"

export default function DashboardPage() {
  const { data: session } = useSession()

  const canCreateProperties = session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SUPER_ADMIN

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "bg-red-500"
      case UserRole.ADMIN:
        return "bg-orange-500"
      case UserRole.OWNER:
        return "bg-blue-500"
      case UserRole.VIEWER:
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "Super Admin"
      case UserRole.ADMIN:
        return "Admin"
      case UserRole.OWNER:
        return "Owner"
      case UserRole.VIEWER:
        return "Viewer"
      default:
        return "Viewer"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Benvenuto, {session?.user.name || session?.user.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getRoleColor(session?.user.role || UserRole.VIEWER)}`}>
            {getRoleLabel(session?.user.role || UserRole.VIEWER)}
          </Badge>
          {canCreateProperties && (
            <Button asChild>
              <Link href="/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuova Struttura
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strutture Totali</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Nessuna struttura configurata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competitor Attivi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Nessun competitor monitorato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prezzi Raccolti</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Ultimi 30 giorni
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alert Attivi</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Nessun alert configurato
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inizia Subito</CardTitle>
            <CardDescription>
              Configura la tua prima struttura per iniziare il monitoraggio dei prezzi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {canCreateProperties ? (
              <>
                <Button asChild className="w-full">
                  <Link href="/properties/new">
                    <Building2 className="mr-2 h-4 w-4" />
                    Crea Prima Struttura
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Una volta creata la struttura, potrai aggiungere competitor e configurare il monitoraggio automatico.
                </p>
              </>
            ) : (
              <>
                <div className="text-center py-4">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Contatta il tuo amministratore per configurare le strutture da monitorare.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attività Recente</CardTitle>
            <CardDescription>
              Ultimi eventi e aggiornamenti del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Nessuna attività recente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
