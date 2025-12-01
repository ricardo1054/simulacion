"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, TrendingDown } from "lucide-react"

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

interface TarjetaVarProps {
  datos: DatosSimulacion
}

export default function TarjetaVar({ datos }: TarjetaVarProps) {
  return (
    <Card className="border-destructive/50 bg-gradient-to-br from-destructive/5 to-transparent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle>Value at Risk (VaR) 95%</CardTitle>
              <CardDescription>Pérdida máxima con 95% de confianza</CardDescription>
            </div>
          </div>
          <TrendingDown className="w-5 h-5 text-destructive opacity-40" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Valor principal del VaR */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pérdida Máxima Esperada</p>
            <p className="text-4xl font-bold text-destructive">${datos.var_95.toFixed(2)}</p>
            <p className="text-sm text-destructive/70">({datos.var_percentaje.toFixed(2)}% del precio inicial)</p>
          </div>

          {/* Explicación */}
          <div className="p-4 bg-card/50 rounded-lg border border-border/50 space-y-2">
            <p className="text-sm font-medium text-foreground">¿Qué significa esto?</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Existe una probabilidad del <strong>95%</strong> de que tu inversión <strong>no pierda más</strong> de{" "}
              <strong>${datos.var_95.toFixed(2)}</strong> durante el período proyectado. En otras palabras, solo hay un
              5% de chance de perder más que esta cantidad.
            </p>
          </div>

          {/* Interpretación del riesgo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <p className="text-xs text-muted-foreground">Retorno Peor Caso</p>
              <p className="text-lg font-bold text-destructive">{datos.var_percentaje.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-chart-1/5 rounded-lg border border-chart-1/20">
              <p className="text-xs text-muted-foreground">Retorno Mejor Caso</p>
              <p className="text-lg font-bold text-chart-1">
                {(
                  ((datos.precio_final_maximo - Number.parseFloat(localStorage.getItem("precioActual") || "100")) /
                    Number.parseFloat(localStorage.getItem("precioActual") || "100")) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
