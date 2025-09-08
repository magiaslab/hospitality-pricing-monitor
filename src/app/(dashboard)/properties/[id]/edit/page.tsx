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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Building2, 
  Save,
  ArrowLeft,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { UserRole } from "@/generated/prisma"

const propertySchema = z.object({
  name: z.string().min(1, "Nome struttura richiesto"),
  city: z.string().min(1, "Città richiesta"),
  country: z.string().optional(),
  propertyType: z.enum(["hotel", "bb", "agriturismo", "casa_vacanze", "altro"]),
  timezone: z.string().min(1, "Timezone richiesto"),
  frequencyCron: z.string().min(1, "Frequenza richiesta"),
  lookaheadDays: z.number().min(1).max(90),
  description: z.string().optional(),
})

interface Property {
  id: string
  name: string
  city: string
  country?: string
  propertyType: string
  timezone: string
  frequencyCron: string
  lookaheadDays: number
  description?: string
}

interface PropertyForm {
  name: string
  city: string
  country?: string
  propertyType: "hotel" | "bb" | "agriturismo" | "casa_vacanze" | "altro"
  timezone: string
  frequencyCron: string
  lookaheadDays: number
  description?: string
}

export default function EditPropertyPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      city: "",
      country: "",
      propertyType: "hotel",
      timezone: "Europe/Rome",
      frequencyCron: "0 0 * * *",
      lookaheadDays: 30,
      description: "",
    },
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      redirect("/auth/signin")
      return
    }

    // Verifica permessi
    const canEdit = session.user.role === UserRole.ADMIN || 
                   session.user.role === UserRole.SUPER_ADMIN

    if (!canEdit) {
      redirect(`/properties/${propertyId}`)
      return
    }

    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}`)
        if (response.ok) {
          const data = await response.json()
          const prop = data.property
          setProperty(prop)
          
          // Popola il form con i dati esistenti
          form.reset({
            name: prop.name,
            city: prop.city,
            country: prop.country || "",
            propertyType: prop.propertyType,
            timezone: prop.timezone,
            frequencyCron: prop.frequencyCron,
            lookaheadDays: prop.lookaheadDays,
            description: prop.description || "",
          })
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
  }, [session, status, propertyId, form])

  const onSubmit = async (values: PropertyForm) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        router.push(`/properties/${propertyId}`)
      } else {
        const error = await response.json()
        console.error("Error updating property:", error)
        setError("Errore nell'aggiornamento della struttura")
      }
    } catch (error) {
      console.error("Error updating property:", error)
      setError("Errore di connessione")
    } finally {
      setSaving(false)
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
          <h1 className="text-2xl font-bold">Modifica Struttura</h1>
          <p className="text-muted-foreground">
            {property.name} - Modifica le informazioni della struttura
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informazioni Struttura
          </CardTitle>
          <CardDescription>
            Modifica le informazioni base della tua struttura ricettiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Struttura *</FormLabel>
                      <FormControl>
                        <Input placeholder="Hotel Bella Vista" {...field} />
                      </FormControl>
                      <FormDescription>
                        Il nome della tua struttura ricettiva
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Struttura *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="bb">B&B</SelectItem>
                          <SelectItem value="agriturismo">Agriturismo</SelectItem>
                          <SelectItem value="casa_vacanze">Casa Vacanze</SelectItem>
                          <SelectItem value="altro">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Tipologia della tua struttura
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Città *</FormLabel>
                      <FormControl>
                        <Input placeholder="Roma" {...field} />
                      </FormControl>
                      <FormDescription>
                        Città dove si trova la struttura
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paese</FormLabel>
                      <FormControl>
                        <Input placeholder="Italia" {...field} />
                      </FormControl>
                      <FormDescription>
                        Paese dove si trova la struttura
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Europe/Rome">Europe/Rome</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                          <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Fuso orario della struttura
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lookaheadDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giorni Monitoraggio *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="90" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Quanti giorni nel futuro monitorare (1-90)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="frequencyCron"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequenza Monitoraggio *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0 0 * * *">Giornaliero (00:00)</SelectItem>
                        <SelectItem value="0 */2 * * *">Ogni 2 ore</SelectItem>
                        <SelectItem value="0 */6 * * *">Ogni 6 ore</SelectItem>
                        <SelectItem value="0 0 * * 1">Settimanale (Lunedì)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Frequenza di monitoraggio dei prezzi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrizione</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrizione della struttura..."
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Breve descrizione della struttura (opzionale)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salva Modifiche
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/properties/${propertyId}`}>
                    Annulla
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
