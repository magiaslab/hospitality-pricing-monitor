"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"
import { Calendar, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react"
import { format, parseISO } from "date-fns"
import { it } from "date-fns/locale"

interface PriceData {
  id: string
  targetDate: string
  price: number
  currency: string
  available: boolean
  competitor: {
    id: string
    name: string
  }
  roomType: {
    id: string
    name: string
  }
  fetchedAt: string
}

interface CompetitorData {
  id: string
  name: string
  active: boolean
}

interface RoomTypeData {
  id: string
  name: string
  code?: string
}

interface PriceComparisonChartProps {
  propertyId: string
  competitors: CompetitorData[]
  roomTypes: RoomTypeData[]
}

export function PriceComparisonChart({
  propertyId,
  competitors,
  roomTypes
}: PriceComparisonChartProps) {
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all")
  const [selectedCompetitors] = useState<string[]>(
    competitors.map(c => c.id)
  )
  const [dateRange, setDateRange] = useState<number>(7) // giorni
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  // Colori per i competitor
  const competitorColors = [
    "#ef4444", "#3b82f6", "#10b981", "#f59e0b",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
  ]

  const fetchPriceData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        propertyId,
        days: dateRange.toString(),
        ...(selectedRoomType !== "all" && { roomTypeId: selectedRoomType }),
        ...(selectedCompetitors.length > 0 && { competitorIds: selectedCompetitors.join(",") })
      })

      const response = await fetch(`/api/properties/${propertyId}/prices?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPriceData(data.prices || [])
      }
    } catch (error) {
      console.error("Error fetching price data:", error)
    } finally {
      setLoading(false)
    }
  }, [propertyId, selectedRoomType, selectedCompetitors, dateRange])

  useEffect(() => {
    if (competitors.length > 0) {
      fetchPriceData()
    }
  }, [competitors.length, fetchPriceData])

  // Elabora i dati per il grafico
  const processedData = () => {
    if (!priceData.length) return []

    // Raggruppa per data
    const groupedByDate = priceData.reduce((acc: Record<string, any>, item) => {
      const date = format(parseISO(item.targetDate), "yyyy-MM-dd")
      if (!acc[date]) {
        acc[date] = { date }
      }

      // Usa il nome del competitor come chiave
      const competitorKey = item.competitor.name
      if (!acc[date][competitorKey]) {
        acc[date][competitorKey] = []
      }
      acc[date][competitorKey].push(item.price)

      return acc
    }, {})

    // Calcola media per competitor per ogni data
    const result = Object.values(groupedByDate).map((dayData: Record<string, any>) => {
      const processed = { ...dayData }

      Object.keys(dayData).forEach(key => {
        if (key !== 'date' && Array.isArray(dayData[key])) {
          // Calcola media dei prezzi
          const prices = dayData[key]
          processed[key] = Number((prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length).toFixed(2))
        }
      })

      return processed
    })

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Statistiche comparative
  const getCompetitorStats = () => {
    if (!priceData.length) return []

    return competitors.map((competitor, index) => {
      const competitorPrices = priceData.filter(p => p.competitor.id === competitor.id)

      if (competitorPrices.length === 0) {
        return {
          competitor,
          avgPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          trend: 0,
          color: competitorColors[index % competitorColors.length],
          dataPoints: 0
        }
      }

      const prices = competitorPrices.map(p => p.price)
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)

      // Calcola trend (confronta primi vs ultimi 3 giorni)
      const sortedData = competitorPrices.sort((a, b) =>
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      )
      const firstThird = sortedData.slice(0, Math.ceil(sortedData.length / 3))
      const lastThird = sortedData.slice(-Math.ceil(sortedData.length / 3))

      const firstAvg = firstThird.reduce((sum, p) => sum + p.price, 0) / firstThird.length
      const lastAvg = lastThird.reduce((sum, p) => sum + p.price, 0) / lastThird.length
      const trend = ((lastAvg - firstAvg) / firstAvg) * 100

      return {
        competitor,
        avgPrice: Number(avgPrice.toFixed(2)),
        minPrice,
        maxPrice,
        trend: Number(trend.toFixed(1)),
        color: competitorColors[index % competitorColors.length],
        dataPoints: competitorPrices.length
      }
    }).filter(stat => stat.dataPoints > 0)
  }

  const chartData = processedData()
  const competitorStats = getCompetitorStats()
  const activeCompetitors = competitors.filter(c => selectedCompetitors.includes(c.id))

  const formatTooltip = (value: number, name: string) => {
    return [`€${value}`, name]
  }

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "dd MMM", { locale: it })
  }

  return (
    <div className="space-y-6">
      {/* Controlli */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Confronto Prezzi Competitor
          </CardTitle>
          <CardDescription>
            Analizza l&apos;andamento dei prezzi dei competitor per ottimizzare la strategia di pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Selezione tipologia camera */}
            {roomTypes.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipologia Camera</label>
                <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Seleziona camera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le camere</SelectItem>
                    {roomTypes.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} {room.code && `(${room.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Periodo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Periodo</label>
              <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(Number(value))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Ultimi 7 giorni</SelectItem>
                  <SelectItem value="14">Ultimi 14 giorni</SelectItem>
                  <SelectItem value="30">Ultimi 30 giorni</SelectItem>
                  <SelectItem value="60">Ultimi 60 giorni</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo grafico */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Visualizzazione</label>
              <Select value={chartType} onValueChange={(value: "line" | "bar") => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Linea</SelectItem>
                  <SelectItem value="bar">Barre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={fetchPriceData} disabled={loading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Aggiorna
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiche competitor */}
      {competitorStats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {competitorStats.map((stat) => (
            <Card key={stat.competitor.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                  {stat.competitor.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{stat.avgPrice}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {stat.trend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  ) : stat.trend < 0 ? (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  <span className={
                    stat.trend > 0 ? "text-red-500" :
                    stat.trend < 0 ? "text-green-500" : ""
                  }>
                    {stat.trend > 0 ? "+" : ""}{stat.trend}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Min: €{stat.minPrice} • Max: €{stat.maxPrice}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.dataPoints} punti dati
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grafico */}
      <Card>
        <CardHeader>
          <CardTitle>Andamento Prezzi</CardTitle>
          <CardDescription>
            {selectedRoomType === "all" ? "Tutte le tipologie" :
             roomTypes.find(r => r.id === selectedRoomType)?.name} •
            Ultimi {dateRange} giorni
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Caricamento dati prezzi...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nessun dato disponibile</h3>
                <p className="text-muted-foreground">
                  Non sono stati trovati dati sui prezzi per il periodo selezionato
                </p>
              </div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                    />
                    <YAxis
                      tickFormatter={(value) => `€${value}`}
                    />
                    <Tooltip
                      formatter={formatTooltip}
                      labelFormatter={(label) => format(parseISO(label), "dd MMMM yyyy", { locale: it })}
                    />
                    <Legend />
                    {activeCompetitors.map((competitor, index) => (
                      <Line
                        key={competitor.id}
                        type="monotone"
                        dataKey={competitor.name}
                        stroke={competitorColors[index % competitorColors.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls={false}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                    />
                    <YAxis
                      tickFormatter={(value) => `€${value}`}
                    />
                    <Tooltip
                      formatter={formatTooltip}
                      labelFormatter={(label) => format(parseISO(label), "dd MMMM yyyy", { locale: it })}
                    />
                    <Legend />
                    {activeCompetitors.map((competitor, index) => (
                      <Bar
                        key={competitor.id}
                        dataKey={competitor.name}
                        fill={competitorColors[index % competitorColors.length]}
                        opacity={0.8}
                      />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dettagli competitor attivi */}
      {activeCompetitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competitor Visualizzati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeCompetitors.map((competitor, index) => (
                <Badge
                  key={competitor.id}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: competitorColors[index % competitorColors.length] }}
                  />
                  {competitor.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}