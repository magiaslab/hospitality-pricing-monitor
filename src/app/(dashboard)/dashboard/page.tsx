"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Users, BarChart3, Plus, TrendingUp, AlertTriangle, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { UserRole } from "@/generated/prisma"

interface Property {
  id: string
  name: string
  city: string
  country?: string
  propertyType: string
  competitors: Array<{
    id: string
    name: string
    active: boolean
  }>
  roomTypes: Array<{
    id: string
    name: string
  }>
  _count: {
    competitors: number
    roomTypes: number
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const canCreateProperties = session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SUPER_ADMIN
  const canManageProperties = session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SUPER_ADMIN

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties')
        if (response.ok) {
          const data = await response.json()
          setProperties(data.properties || [])
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchProperties()
    }
  }, [session])

  const deleteProperty = async (propertyId: string, propertyName: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${propertyName}"? Questa azione non può essere annullata.`)) {
      return
    }

    setDeleting(propertyId)
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId))
      } else {
        const error = await response.json()
        alert(`Errore nell'eliminazione: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Errore di connessione')
    } finally {
      setDeleting(null)
    }
  }

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
            <div className="text-2xl font-bold">{loading ? "..." : properties.length}</div>
            <p className="text-xs text-muted-foreground">
              {properties.length === 0 ? "Nessuna struttura configurata" : "Strutture monitorate"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competitor Attivi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : properties.reduce((total, p) => total + p._count.competitors, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Competitor monitorati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipologie Camere</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : properties.reduce((total, p) => total + p._count.roomTypes, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Camere configurate
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

      {/* Properties List */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Caricamento strutture...</p>
            </div>
          </CardContent>
        </Card>
      ) : properties.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Le Tue Strutture</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <CardDescription>
                        {property.city}{property.country ? `, ${property.country}` : ""}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {property.propertyType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Competitor:</span>
                    <span className="font-medium">{property._count.competitors}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Camere:</span>
                    <span className="font-medium">{property._count.roomTypes}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/properties/${property.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizza
                      </Link>
                    </Button>
                    {canManageProperties && (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/properties/${property.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteProperty(property.id, property.name)}
                          disabled={deleting === property.id}
                        >
                          {deleting === property.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
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
      )}
    </div>
  )
}
