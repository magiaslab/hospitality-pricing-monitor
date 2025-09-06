"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  MapPin, 
  Palette, 
  Settings, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Plus,
  Trash2
} from "lucide-react"
import { createPropertySchema } from "@/lib/validations"

// Schema per step individuali
const basicInfoSchema = z.object({
  name: z.string().min(1, "Nome struttura richiesto"),
  city: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  propertyType: z.string().optional(),
  ownerId: z.string().min(1, "Owner richiesto"),
})

const brandingSchema = z.object({
  brandingLogoUrl: z.string().url().optional().or(z.literal("")),
  brandingPrimaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  brandingAccentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
})

const scrapingSchema = z.object({
  defaultTimezone: z.string().optional(),
  defaultFrequencyCron: z.string().optional(),
  defaultLookaheadDays: z.number().int().min(1).max(365).optional(),
})

const roomTypeSchema = z.object({
  name: z.string().min(1, "Nome richiesto"),
  code: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
})

interface User {
  id: string
  email: string
  name?: string
  role: string
}

interface PropertyWizardProps {
  users: User[]
}

export function PropertyWizard({ users }: PropertyWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roomTypes, setRoomTypes] = useState<Array<{ name: string; code?: string; capacity?: number }>>([])

  const form = useForm<z.infer<typeof createPropertySchema>>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      name: "",
      city: "",
      country: "",
      address: "",
      propertyType: "",
      ownerId: "",
      brandingLogoUrl: "",
      brandingPrimaryColor: "#ef4444",
      brandingAccentColor: "#f97316",
      theme: "light",
      defaultTimezone: "Europe/Rome",
      defaultFrequencyCron: "0 */2 * * *",
      defaultLookaheadDays: 30,
    },
  })

  const steps = [
    {
      id: "basic",
      title: "Informazioni Base",
      description: "Dati principali della struttura",
      icon: Building2,
      schema: basicInfoSchema,
    },
    {
      id: "branding",
      title: "Branding",
      description: "Personalizzazione visiva",
      icon: Palette,
      schema: brandingSchema,
    },
    {
      id: "rooms",
      title: "Tipologie Camere",
      description: "Configura le tipologie di camera",
      icon: Settings,
    },
    {
      id: "scraping",
      title: "Configurazione Scraping",
      description: "Impostazioni monitoraggio",
      icon: Settings,
      schema: scrapingSchema,
    },
    {
      id: "review",
      title: "Riepilogo",
      description: "Verifica e conferma",
      icon: Check,
    },
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const validateCurrentStep = async () => {
    if (!currentStepData.schema) return true

    const values = form.getValues()
    try {
      currentStepData.schema.parse(values)
      return true
    } catch (error) {
      // Trigger validation errors
      await form.trigger()
      return false
    }
  }

  const nextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { name: "", code: "", capacity: 1 }])
  }

  const removeRoomType = (index: number) => {
    setRoomTypes(roomTypes.filter((_, i) => i !== index))
  }

  const updateRoomType = (index: number, field: string, value: string | number | boolean) => {
    const updated = [...roomTypes]
    updated[index] = { ...updated[index], [field]: value }
    setRoomTypes(updated)
  }

  const onSubmit = async (values: z.infer<typeof createPropertySchema>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        const { property } = await response.json()
        
        // Crea room types se presenti
        if (roomTypes.length > 0) {
          await Promise.all(
            roomTypes.map(roomType =>
              fetch("/api/room-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...roomType,
                  propertyId: property.id,
                }),
              })
            )
          )
        }

        router.push(`/properties/${property.id}`)
      } else {
        const error = await response.json()
        console.error("Error creating property:", error)
      }
    } catch (error) {
      console.error("Error creating property:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Nuova Struttura</h1>
        <p className="text-muted-foreground">
          Configura una nuova struttura ricettiva per il monitoraggio prezzi
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Passo {currentStep + 1} di {steps.length}</span>
          <span>{Math.round(progress)}% completato</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <currentStepData.icon className="w-5 h-5" />
                {currentStepData.title}
              </CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nome Struttura *</FormLabel>
                        <FormControl>
                          <Input placeholder="Hotel Bella Vista" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipologia</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona tipologia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hotel">Hotel</SelectItem>
                            <SelectItem value="bnb">B&B</SelectItem>
                            <SelectItem value="apartment">Appartamento</SelectItem>
                            <SelectItem value="resort">Resort</SelectItem>
                            <SelectItem value="hostel">Hostel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proprietario *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona proprietario" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name || user.email}
                                <Badge variant="secondary" className="ml-2">
                                  {user.role}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Città</FormLabel>
                        <FormControl>
                          <Input placeholder="Roma" {...field} />
                        </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Indirizzo</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Via Roma 123, 00100 Roma RM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Branding */}
              {currentStep === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="brandingLogoUrl"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>URL Logo</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL del logo da utilizzare nella dashboard del proprietario
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandingPrimaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Colore Primario</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" className="w-16" {...field} />
                            <Input placeholder="#ef4444" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandingAccentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Colore Accent</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" className="w-16" {...field} />
                            <Input placeholder="#f97316" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tema</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Chiaro</SelectItem>
                            <SelectItem value="dark">Scuro</SelectItem>
                            <SelectItem value="system">Sistema</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Room Types */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Tipologie Camere</h3>
                      <p className="text-sm text-muted-foreground">
                        Aggiungi le tipologie di camera da monitorare
                      </p>
                    </div>
                    <Button type="button" onClick={addRoomType}>
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi
                    </Button>
                  </div>

                  {roomTypes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nessuna tipologia camera configurata</p>
                      <p className="text-sm">Clicca &quot;Aggiungi&quot; per iniziare</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {roomTypes.map((roomType, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="grid gap-4 md:grid-cols-4">
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium">Nome *</label>
                                <Input
                                  placeholder="Camera Doppia"
                                  value={roomType.name}
                                  onChange={(e) => updateRoomType(index, "name", e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Codice</label>
                                <Input
                                  placeholder="DBL"
                                  value={roomType.code}
                                  onChange={(e) => updateRoomType(index, "code", e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="text-sm font-medium">Capacità</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={roomType.capacity}
                                    onChange={(e) => updateRoomType(index, "capacity", parseInt(e.target.value))}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-6"
                                  onClick={() => removeRoomType(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Scraping Config */}
              {currentStep === 3 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="defaultTimezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
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
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultLookaheadDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giorni Monitoraggio</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Numero di giorni futuri da monitorare
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultFrequencyCron"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Frequenza Scraping</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0 */1 * * *">Ogni ora</SelectItem>
                            <SelectItem value="0 */2 * * *">Ogni 2 ore</SelectItem>
                            <SelectItem value="0 */4 * * *">Ogni 4 ore</SelectItem>
                            <SelectItem value="0 */6 * * *">Ogni 6 ore</SelectItem>
                            <SelectItem value="0 */12 * * *">Ogni 12 ore</SelectItem>
                            <SelectItem value="0 0 * * *">Una volta al giorno</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Frequenza di esecuzione del web scraping
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Riepilogo Configurazione</h3>
                  
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Base</TabsTrigger>
                      <TabsTrigger value="branding">Branding</TabsTrigger>
                      <TabsTrigger value="rooms">Camere</TabsTrigger>
                      <TabsTrigger value="scraping">Scraping</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid gap-2">
                        <div><strong>Nome:</strong> {form.getValues("name")}</div>
                        <div><strong>Tipologia:</strong> {form.getValues("propertyType") || "Non specificata"}</div>
                        <div><strong>Città:</strong> {form.getValues("city") || "Non specificata"}</div>
                        <div><strong>Paese:</strong> {form.getValues("country") || "Non specificato"}</div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="branding" className="space-y-4">
                      <div className="grid gap-2">
                        <div><strong>Tema:</strong> {form.getValues("theme")}</div>
                        <div className="flex items-center gap-2">
                          <strong>Colore Primario:</strong>
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: form.getValues("brandingPrimaryColor") }}
                          />
                          {form.getValues("brandingPrimaryColor")}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="rooms" className="space-y-4">
                      {roomTypes.length === 0 ? (
                        <p className="text-muted-foreground">Nessuna tipologia camera configurata</p>
                      ) : (
                        <div className="space-y-2">
                          {roomTypes.map((room, index) => (
                            <div key={index} className="flex items-center gap-4 p-2 border rounded">
                              <span><strong>{room.name}</strong></span>
                              {room.code && <Badge variant="secondary">{room.code}</Badge>}
                              {room.capacity && <span className="text-sm text-muted-foreground">Capacità: {room.capacity}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="scraping" className="space-y-4">
                      <div className="grid gap-2">
                        <div><strong>Timezone:</strong> {form.getValues("defaultTimezone")}</div>
                        <div><strong>Frequenza:</strong> {form.getValues("defaultFrequencyCron")}</div>
                        <div><strong>Giorni Monitoraggio:</strong> {form.getValues("defaultLookaheadDays")}</div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creazione..." : "Crea Struttura"}
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Avanti
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
