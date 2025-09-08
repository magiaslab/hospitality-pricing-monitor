"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus, Shield } from "lucide-react"
import Link from "next/link"
import { UserRole } from "@/generated/prisma"

export default function AdminUsersPage() {
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

  // Verifica permessi admin
  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN) {
    redirect("/dashboard")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Utenti</h1>
          <p className="text-muted-foreground">
            Gestisci utenti, ruoli e permessi
          </p>
        </div>
        <Button asChild>
          <Link href="/auth/signup">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Utente
          </Link>
        </Button>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestione Utenti
          </CardTitle>
          <CardDescription>
            Funzionalità in sviluppo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Funzionalità in Arrivo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              La gestione completa degli utenti sarà disponibile nella prossima versione.
            </p>
            <p className="text-sm text-muted-foreground">
              Per ora puoi creare nuovi utenti tramite la pagina di registrazione.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" asChild>
              <Link href="/auth/signup">
                <Plus className="mr-2 h-4 w-4" />
                Crea Utente
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Torna alla Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
