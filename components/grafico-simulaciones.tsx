"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DatosSimulacion {
  simulaciones: number[][]
  promedio: number[]
  percentil_5: number[]
  percentil_95: number[]
  precio_final_promedio: number
  precio_final_minimo: number
  precio_final_maximo: number
  var_95: number
  var_percentaje: number
}

interface GraficoSimulacionesProps {
  datos: DatosSimulacion
}

export default function GraficoSimulaciones({ datos }: GraficoSimulacionesProps) {
  const numPuntos = datos.promedio.length

  const datosArea = Array.from({ length: numPuntos }, (_, dia) => ({
    dia,
    percentil_5: Math.round(datos.percentil_5[dia] * 100) / 100,
    promedio: Math.round(datos.promedio[dia] * 100) / 100,
    percentil_95: Math.round(datos.percentil_95[dia] * 100) / 100,
  }))

  const preciosFinales = datos.simulaciones.map((sim) => sim[sim.length - 1])
  const min = Math.min(...preciosFinales)
  const max = Math.max(...preciosFinales)
  const numBins = 20
  const binSize = (max - min) / numBins
  const bins = Array(numBins).fill(0)

  preciosFinales.forEach((precio) => {
    const binIndex = Math.min(Math.floor((precio - min) / binSize), numBins - 1)
    bins[binIndex]++
  })

  const datosHistograma = bins.map((count, idx) => ({
    rango: `$${(min + idx * binSize).toFixed(0)}`,
    frecuencia: count,
  }))

  return (
    <div className="space-y-6">
      {/* Gráfico de Área */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Precios Proyectados</CardTitle>
          <CardDescription>Rango probable de precios: percentil 5% (inferior) a 95% (superior)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={datosArea} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPromedio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRango" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="dia" label={{ value: "Días", position: "insideBottomRight", offset: -5 }} />
              <YAxis label={{ value: "Precio ($)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: any) => `$${(value as number).toFixed(2)}`}
              />
              <Legend />

              {/* Rango de confianza (área entre percentiles) */}
              <Area
                type="monotone"
                dataKey="percentil_95"
                stackId="1"
                stroke="none"
                fill="hsl(var(--chart-3))"
                fillOpacity={0.2}
                name="Percentil 95"
              />
              <Area
                type="monotone"
                dataKey="percentil_5"
                stackId="1"
                stroke="none"
                fill="hsl(var(--background))"
                name="Percentil 5"
              />

              {/* Promedio destacado */}
              <Area
                type="monotone"
                dataKey="promedio"
                stroke="hsl(var(--chart-2))"
                strokeWidth={3}
                fill="url(#colorPromedio)"
                name="Promedio"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Leyenda explicativa */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-card/50 rounded-lg border border-border">
              <p className="text-muted-foreground text-xs">Área Sombreada</p>
              <p className="font-medium">Intervalo de Confianza 90%</p>
              <p className="text-xs text-muted-foreground mt-1">Entre percentiles 5 y 95</p>
            </div>
            <div className="p-3 bg-card/50 rounded-lg border border-border">
              <p className="text-muted-foreground text-xs">Línea Azul</p>
              <p className="font-medium">Precio Promedio Esperado</p>
              <p className="text-xs text-muted-foreground mt-1">Resultado más probable</p>
            </div>
            <div className="p-3 bg-card/50 rounded-lg border border-border">
              <p className="text-muted-foreground text-xs">Basado en</p>
              <p className="font-medium">{datos.simulaciones.length} Simulaciones</p>
              <p className="text-xs text-muted-foreground mt-1">Método Monte Carlo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histograma de Precios Finales */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Precios Finales</CardTitle>
          <CardDescription>Frecuencia de precios al final del período de proyección</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosHistograma} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="rango" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: "Frecuencia", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="frecuencia" fill="hsl(var(--chart-1))" name="Cantidad de Simulaciones" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-card/50 rounded-lg border border-border">
              <p className="text-muted-foreground text-xs">Precio Final Esperado</p>
              <p className="text-xl font-bold text-chart-2">${datos.precio_final_promedio.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-card/50 rounded-lg border border-border">
              <p className="text-muted-foreground text-xs">Rango de Precios Observados</p>
              <p className="text-sm font-medium">
                ${datos.precio_final_minimo.toFixed(2)} - ${datos.precio_final_maximo.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
