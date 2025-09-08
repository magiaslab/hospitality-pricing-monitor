"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { redirect, useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Plus,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Save,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { UserRole } from "@/generated/prisma"

const competitorSchema = z.object({
  name: z.string().min(1, "Nome competitor richiesto"),
  bookingUrl: z.string().url("URL non valido").optional().or(z.literal("")),
  notes: z.string().optional(),
})

interface Property {
  id: string
  name: string
  competitors: Array<{
    id: string
    name: string
    bookingUrl?: string
    notes?: string
    isActive: boolean
  }>
}

interface CompetitorForm {
  name: string
  bookingUrl: string
  notes: string
}

export default function PropertyCompetitorsPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CompetitorForm>({
    resolver: zodResolver(competitorSchema),
    defaultValues: {
      name: "",
      bookingUrl: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      redirect("/auth/signin")
      return
    }

    // Verifica permessi
    const canManage = session.user.role === UserRole.ADMIN || 
                     session.user.role === UserRole.SUPER_ADMIN

    if (!canManage) {
      redirect(`/properties/${propertyId}`)
      return
    }

    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}`)
        if (response.ok) {
          const data = await response.json()
          setProperty(data.property)
        } else if (response.status === 404) {
          setError("Struttura non trovata")
        } else {
          setError("Errore nel caricamento della struttura")
        }
      } catch (error) {
        console.error("Error fetching property:", error)
        setError("Errore di connessione")
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [session, status, propertyId])

  const onSubmit = async (values: CompetitorForm) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/competitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        const newCompetitor = await response.json()
        setProperty(prev => prev ? {
          ...prev,
          competitors: [...prev.competitors, newCompetitor.competitor]
        } : null)
        
        // Reset form
        form.reset()
      } else {
        const error = await response.json()
        console.error("Error creating competitor:", error)
      }
    } catch (error) {
      console.error("Error creating competitor:", error)
    } finally {
      setSaving(false)
    }
  }

  const deleteCompetitor = async (competitorId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/competitors/${competitorId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProperty(prev => prev ? {
          ...prev,
          competitors: prev.competitors.filter(c => c.id !== competitorId)
        } : null)
      } else {
        console.error("Error deleting competitor")
      }
    } catch (error) {
      console.error("Error deleting competitor:", error)
    }
  }

  const toggleCompetitorStatus = async (competitorId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/competitors/${competitorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setProperty(prev => prev ? {
          ...prev,
          competitors: prev.competitors.map(c => 
            c.id === competitorId ? { ...c, isActive } : c
          )
        } : null)
      } else {
        console.error("Error updating competitor")
      }
    } catch (error) {
      console.error("Error updating competitor:", error)
    }
  }

  if (status === "loading" || loading) {
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
    return null
  }

  if (error || !property) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">
                {error || "Struttura non trovata"}
              </h2>
              <p className="text-muted-foreground mb-4">
                La struttura richiesta non esiste o non hai i permessi per modificarla.
              </p>
              <Button asChild>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/properties/${propertyId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Gestione Competitor</h1>
          <p className="text-muted-foreground">
            {property.name} - Configura i competitor da monitorare
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Competitor Form */}
        <Card>
          <CardHeader>
            <CardTitle>Aggiungi Nuovo Competitor</CardTitle>
            <CardDescription>
              Inserisci i dati del competitor da monitorare per il pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Competitor *</FormLabel>
                      <FormControl>
                        <Input placeholder="Hotel Competitor" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome della struttura competitor da monitorare
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bookingUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Booking</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://www.booking.com/hotel/..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Link alla pagina di prenotazione su Booking.com o altra OTA
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Note aggiuntive sul competitor..."
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Informazioni aggiuntive o note sul competitor
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                      Aggiunta...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi Competitor
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Competitors List */}
        <Card>
          <CardHeader>
            <CardTitle>Competitor Configurati</CardTitle>
            <CardDescription>
              {property.competitors.length} competitor configurati
            </CardDescription>
          </CardHeader>
          <CardContent>
            {property.competitors.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nessun competitor</h3>
                <p className="text-muted-foreground">
                  Aggiungi il primo competitor per iniziare il monitoraggio
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {property.competitors.map((competitor) => (
                  <div key={competitor.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{competitor.name}</h4>
                        {competitor.bookingUrl && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ExternalLink className="h-3 w-3" />
                            <a 
                              href={competitor.bookingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              Visualizza su OTA
                            </a>
                          </div>
                        )}
                        {competitor.notes && (
                          <p className="text-sm text-muted-foreground">
                            {competitor.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={competitor.isActive ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleCompetitorStatus(competitor.id, !competitor.isActive)}
                        >
                          {competitor.isActive ? "Attivo" : "Inattivo"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCompetitor(competitor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Istruzioni per il Monitoraggio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Come funziona</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• I competitor attivi vengono monitorati automaticamente</li>
                <li>• Il sistema raccoglie i prezzi secondo la frequenza impostata</li>
                <li>• I dati vengono salvati nel database per analisi</li>
                <li>• Puoi attivare/disattivare competitor cliccando sul badge</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">URL Supportati</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Booking.com</li>
                <li>• Expedia (in sviluppo)</li>
                <li>• Hotels.com (in sviluppo)</li>
                <li>• Altri siti personalizzati</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Suggerimento:</strong> Assicurati che gli URL puntino direttamente alla pagina 
              della struttura competitor per un monitoraggio accurato dei prezzi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
