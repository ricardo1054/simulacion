"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface FormularioParametrosProps {
  onSimular: (parametros: {
    precioActual: number
    volatilidad: number
    dias: number
    simulaciones: number
  }) => void
  cargando: boolean
}

export default function FormularioParametros({ onSimular, cargando }: FormularioParametrosProps) {
  const [precioActual, setPrecioActual] = useState("100")
  const [volatilidad, setVolatilidad] = useState("20")
  const [dias, setDias] = useState("30")
  const [simulaciones, setSimulaciones] = useState("1000")

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault()

    onSimular({
      precioActual: Number.parseFloat(precioActual),
      volatilidad: Number.parseFloat(volatilidad),
      dias: Number.parseInt(dias),
      simulaciones: Number.parseInt(simulaciones),
    })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Parámetros de Simulación</CardTitle>
        <CardDescription>Configura los parámetros del activo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={manejarEnvio} className="space-y-6">
          {/* Precio Actual */}
          <div className="space-y-2">
            <Label htmlFor="precio" className="text-sm font-medium">
              Precio Actual ($)
            </Label>
            <Input
              id="precio"
              type="number"
              step="0.01"
              min="0.01"
              value={precioActual}
              onChange={(e) => setPrecioActual(e.target.value)}
              placeholder="100"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Precio inicial del activo financiero</p>
          </div>

          {/* Volatilidad */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="volatilidad" className="text-sm font-medium">
                Volatilidad Anualizada
              </Label>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{volatilidad}%</span>
            </div>
            <Input
              id="volatilidad"
              type="range"
              min="1"
              max="100"
              value={volatilidad}
              onChange={(e) => setVolatilidad(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Desviación estándar anualizada de retornos (1-100%)</p>
          </div>

          {/* Días */}
          <div className="space-y-2">
            <Label htmlFor="dias" className="text-sm font-medium">
              Período de Proyección (días)
            </Label>
            <Input
              id="dias"
              type="number"
              min="1"
              max="365"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              placeholder="30"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Número de días a proyectar (1-365)</p>
          </div>

          {/* Simulaciones */}
          <div className="space-y-2">
            <Label htmlFor="simulaciones" className="text-sm font-medium">
              Número de Simulaciones
            </Label>
            <Input
              id="simulaciones"
              type="number"
              min="100"
              max="10000"
              step="100"
              value={simulaciones}
              onChange={(e) => setSimulaciones(e.target.value)}
              placeholder="1000"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Caminos aleatorios a generar (100-10000)</p>
          </div>

          {/* Botón Submit */}
          <Button type="submit" disabled={cargando} className="w-full" size="lg">
            {cargando ? "Ejecutando..." : "Ejecutar Simulación"}
          </Button>

          {/* Presets */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-3">Presets de ejemplo:</p>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs bg-transparent"
                onClick={() => {
                  setPrecioActual("100")
                  setVolatilidad("15")
                  setDias("30")
                  setSimulaciones("1000")
                }}
              >
                Activo Estable
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs bg-transparent"
                onClick={() => {
                  setPrecioActual("100")
                  setVolatilidad("50")
                  setDias("60")
                  setSimulaciones("2000")
                }}
              >
                Activo Volátil
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs bg-transparent"
                onClick={() => {
                  setPrecioActual("100")
                  setVolatilidad("80")
                  setDias("90")
                  setSimulaciones("5000")
                }}
              >
                Activo Muy Riesgoso
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
