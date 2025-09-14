"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { redirect, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  MapPin,
  Users,
  BarChart3,
  Settings,
  Plus,
  ExternalLink,
  Calendar,
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { UserRole } from "@/generated/prisma"
import { PriceComparisonChart } from "@/components/charts/price-comparison-chart"

interface Property {
  id: string
  name: string
  city?: string
  country?: string
  address?: string
  propertyType?: string
  brandingLogoUrl?: string
  brandingPrimaryColor?: string
  brandingAccentColor?: string
  theme?: string
  defaultTimezone?: string
  defaultFrequencyCron?: string
  defaultLookaheadDays?: number
  owner: {
    id: string
    name?: string
    email: string
    role: string
  }
  roomTypes: Array<{
    id: string
    name: string
    code?: string
    capacity?: number
  }>
  competitors: Array<{
    id: string
    name: string
    bookingUrl?: string
    isActive: boolean
  }>
  _count?: {
    competitors: number
    roomTypes: number
    priceHistory: number
  }
}

export default function PropertyDetailPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      redirect("/auth/signin")
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

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento struttura...</p>
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
                La struttura richiesta non esiste o non hai i permessi per visualizzarla.
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

  const canManage = session.user.role === UserRole.ADMIN || 
                   session.user.role === UserRole.SUPER_ADMIN ||
                   property.owner.id === session.user.id

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{property.name}</h1>
          </div>
          {(property.city || property.country) && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {[property.city, property.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {property.propertyType && (
            <Badge variant="secondary">{property.propertyType}</Badge>
          )}
        </div>
        
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/properties/${property.id}/competitors`}>
                <Plus className="h-4 w-4 mr-2" />
                Gestisci Competitor
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/properties/${property.id}/edit`}>
                <Settings className="h-4 w-4 mr-2" />
                Modifica
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipologie Camere</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property._count?.roomTypes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {property._count?.roomTypes === 0 ? "Nessuna configurata" : "Configurate"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competitor</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property._count?.competitors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {property._count?.competitors === 0 ? "Nessuno monitorato" : "Monitorati"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dati Raccolti</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property._count?.priceHistory || 0}</div>
            <p className="text-xs text-muted-foreground">
              Record di prezzo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequenza</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{property.defaultFrequencyCron || "Non configurata"}</div>
            <p className="text-xs text-muted-foreground">
              Scraping automatico
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="prices">Prezzi & Analytics</TabsTrigger>
          <TabsTrigger value="rooms">Camere</TabsTrigger>
          <TabsTrigger value="competitors">Competitor</TabsTrigger>
          <TabsTrigger value="settings">Configurazione</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Struttura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p>{property.name}</p>
                </div>
                {property.address && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Indirizzo</label>
                    <p>{property.address}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Proprietario</label>
                  <div className="flex items-center gap-2">
                    <span>{property.owner.name || property.owner.email}</span>
                    <Badge variant="secondary">{property.owner.role}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurazione Monitoraggio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                  <p>{property.defaultTimezone || "Non configurato"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Giorni Monitoraggio</label>
                  <p>{property.defaultLookaheadDays || "Non configurato"} giorni</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Frequenza</label>
                  <p>{property.defaultFrequencyCron || "Non configurata"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prices" className="space-y-4">
          {property.competitors.length === 0 || property.roomTypes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Dati insufficienti per analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Per visualizzare i grafici dei prezzi hai bisogno di:
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center justify-center gap-2">
                      {property.competitors.length === 0 ? (
                        <span className="text-red-500">✗ Almeno 1 competitor configurato</span>
                      ) : (
                        <span className="text-green-500">✓ Competitor configurati</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      {property.roomTypes.length === 0 ? (
                        <span className="text-red-500">✗ Almeno 1 tipologia camera</span>
                      ) : (
                        <span className="text-green-500">✓ Tipologie camere configurate</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-orange-500">⚠ Dati storici dai competitor</span>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-2 justify-center">
                      {property.competitors.length === 0 && (
                        <Button asChild variant="outline">
                          <Link href={`/properties/${property.id}/competitors`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Aggiungi Competitor
                          </Link>
                        </Button>
                      )}
                      {property.roomTypes.length === 0 && (
                        <Button asChild>
                          <Link href={`/properties/${property.id}/rooms/new`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Aggiungi Camere
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <PriceComparisonChart
              propertyId={property.id}
              competitors={property.competitors.map(c => ({
                id: c.id,
                name: c.name,
                active: c.isActive
              }))}
              roomTypes={property.roomTypes}
            />
          )}
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Tipologie Camere</h3>
              <p className="text-sm text-muted-foreground">
                Gestisci le tipologie di camera da monitorare
              </p>
            </div>
            {canManage && (
              <Button asChild>
                <Link href={`/properties/${property.id}/rooms/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Camera
                </Link>
              </Button>
            )}
          </div>

          {property.roomTypes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nessuna tipologia camera</h3>
                  <p className="text-muted-foreground mb-4">
                    Aggiungi le tipologie di camera per iniziare il monitoraggio
                  </p>
                  {canManage && (
                    <Button asChild>
                      <Link href={`/properties/${property.id}/rooms/new`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Aggiungi Prima Camera
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {property.roomTypes.map((room) => (
                <Card key={room.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{room.name}</CardTitle>
                    {room.code && (
                      <CardDescription>
                        <Badge variant="outline">{room.code}</Badge>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {room.capacity && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Capacità: {room.capacity} persone
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Competitor Monitorati</h3>
              <p className="text-sm text-muted-foreground">
                Gestisci i competitor da cui raccogliere i prezzi
              </p>
            </div>
            {canManage && (
              <Button asChild>
                <Link href={`/properties/${property.id}/competitors`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Gestisci Competitor
                </Link>
              </Button>
            )}
          </div>

          {property.competitors.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nessun competitor configurato</h3>
                  <p className="text-muted-foreground mb-4">
                    Aggiungi competitor per iniziare il monitoraggio dei prezzi
                  </p>
                  {canManage && (
                    <Button asChild>
                      <Link href={`/properties/${property.id}/competitors`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Aggiungi Primo Competitor
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {property.competitors.map((competitor) => (
                <Card key={competitor.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
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
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={competitor.isActive ? "default" : "secondary"}>
                          {competitor.isActive ? "Attivo" : "Inattivo"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurazioni Avanzate</CardTitle>
              <CardDescription>
                Impostazioni per il monitoraggio e la personalizzazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Branding</h4>
                  {property.brandingLogoUrl && (
                    <div>
                      <label className="text-sm text-muted-foreground">Logo URL</label>
                      <p className="text-sm">{property.brandingLogoUrl}</p>
                    </div>
                  )}
                  <div className="flex gap-4">
                    {property.brandingPrimaryColor && (
                      <div>
                        <label className="text-sm text-muted-foreground">Colore Primario</label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: property.brandingPrimaryColor }}
                          />
                          <span className="text-sm">{property.brandingPrimaryColor}</span>
                        </div>
                      </div>
                    )}
                    {property.brandingAccentColor && (
                      <div>
                        <label className="text-sm text-muted-foreground">Colore Accent</label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: property.brandingAccentColor }}
                          />
                          <span className="text-sm">{property.brandingAccentColor}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Tema</h4>
                  <p className="text-sm">{property.theme || "Sistema"}</p>
                </div>
              </div>
              
              {canManage && (
                <div className="pt-4 border-t">
                  <Button asChild>
                    <Link href={`/properties/${property.id}/edit`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Modifica Configurazione
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
