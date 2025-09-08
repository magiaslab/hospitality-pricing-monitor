"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Plus } from "lucide-react"
import Link from "next/link"
import { UserRole } from "@/generated/prisma"

export default function AdminPropertiesPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Gestione Proprietà</h1>
          <p className="text-muted-foreground">
            Gestisci tutte le proprietà del sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuova Struttura
          </Link>
        </Button>
      </div>

      {/* Redirect Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Gestione Proprietà
          </CardTitle>
          <CardDescription>
            La gestione delle proprietà è stata spostata nella dashboard principale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Per una migliore esperienza utente, tutte le funzioni di gestione delle proprietà 
            sono ora disponibili direttamente nella dashboard principale.
          </p>
          <Button asChild>
            <Link href="/dashboard">
              <Building2 className="mr-2 h-4 w-4" />
              Vai alla Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
