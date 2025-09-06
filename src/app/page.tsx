"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Building2, TrendingUp, Users, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return
    
    if (session) {
      redirect("/dashboard")
    }
  }, [session, status])

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

  if (session) {
    return null // Redirect handled above
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">Pricing Monitor</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Accedi</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Registrati</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Monitora i Prezzi dei{" "}
            <span className="text-primary">Competitor</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Piattaforma SaaS completa per il monitoraggio automatico dei prezzi competitor 
            nel settore hospitality. Ottimizza la tua strategia di pricing con dati in tempo reale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Inizia Gratis
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">
                Accedi
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Funzionalità Principali</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tutto quello che ti serve per monitorare e analizzare i prezzi dei competitor
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Gestione Strutture</CardTitle>
              <CardDescription>
                Configura e gestisci tutte le tue strutture ricettive da un unico pannello
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Setup tipologie camere</li>
                <li>• Configurazione competitor</li>
                <li>• Branding personalizzato</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Monitoraggio Automatico</CardTitle>
              <CardDescription>
                Web scraping automatizzato con integrazione n8n per raccolta dati continua
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Scraping programmato</li>
                <li>• Selettori CSS personalizzati</li>
                <li>• Gestione errori avanzata</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Analytics Avanzate</CardTitle>
              <CardDescription>
                Dashboard interattive con grafici e report per analisi approfondite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Calendario prezzi interattivo</li>
                <li>• Trend storici</li>
                <li>• Export PDF/Excel</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Multi-Tenant</CardTitle>
              <CardDescription>
                Sistema di ruoli granulari per gestione team e accessi controllati
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ruoli Super Admin, Admin, Owner, Viewer</li>
                <li>• Accessi per singola proprietà</li>
                <li>• Sistema inviti</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Sicurezza</CardTitle>
              <CardDescription>
                Autenticazione sicura e audit trail completo per tracciabilità
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• OAuth Google + credenziali</li>
                <li>• Log attività utente</li>
                <li>• Permessi granulari</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Alert Intelligenti</CardTitle>
              <CardDescription>
                Notifiche automatiche su variazioni prezzi e anomalie di mercato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Alert personalizzabili</li>
                <li>• Email e Slack</li>
                <li>• Soglie dinamiche</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Pronto per Iniziare?</h2>
          <p className="text-muted-foreground mb-8">
            Unisciti alle strutture che già utilizzano la nostra piattaforma per ottimizzare i prezzi
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              Inizia Gratis Ora
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 Hospitality Pricing Monitor. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  )
}