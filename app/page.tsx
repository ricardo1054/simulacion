"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FormularioParametros from "@/components/formulario-parametros"
import GraficoSimulaciones from "@/components/grafico-simulaciones"
import TarjetaVar from "@/components/tarjeta-var"

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

export default function Home() {
  const [datos, setDatos] = useState<DatosSimulacion | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // La API ahora está en /api/simular (Next.js API Route)

  const manejarSimulacion = async (parametros: {
    precioActual: number
    volatilidad: number
    dias: number
    simulaciones: number
  }) => {
    setCargando(true)
    setError(null)

    try {
      const url = process.env.NODE_ENV === "production" ? "/api/simular" : "/api/simular"

      const respuesta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monto_inicial: parametros.precioActual,
          volatilidad_anual: parametros.volatilidad,
          horizonte_temporal: parametros.dias,
          cantidad_iteraciones: parametros.simulaciones,
        }),
      })

      if (!respuesta.ok) {
        const dataError = await respuesta.json()
        throw new Error(dataError.detail || dataError.error || "Error en la simulación")
      }

      const resultado: DatosSimulacion = await respuesta.json()
      setDatos(resultado)
    } catch (err) {
      let mensajeError = "Error desconocido"

      if (err instanceof Error) {
        mensajeError = err.message
      }

      setError(mensajeError)
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Encabezado */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Simulador de Riesgo Financiero</h1>
          <p className="text-lg text-muted-foreground">
            Utiliza el Método de Monte Carlo para proyectar posibles futuros de un activo financiero
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Formulario */}
          <div className="lg:col-span-1">
            <FormularioParametros onSimular={manejarSimulacion} cargando={cargando} />
          </div>

          {/* Columna derecha: Resultados */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive text-sm font-medium">Error: {error}</p>
                </CardContent>
              </Card>
            )}

            {datos && (
              <>
                {/* Gráfico de simulaciones */}
                <GraficoSimulaciones datos={datos} />

                {/* Tarjeta de VaR */}
                <TarjetaVar datos={datos} />

                {/* Estadísticas de precios finales */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas de Precios Finales</CardTitle>
                    <CardDescription>Proyección al final del período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Promedio</p>
                        <p className="text-2xl font-bold text-foreground">${datos.precio_final_promedio.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Mínimo</p>
                        <p className="text-2xl font-bold text-destructive">${datos.precio_final_minimo.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Máximo</p>
                        <p className="text-2xl font-bold text-chart-1">${datos.precio_final_maximo.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!datos && !error && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Ingresa los parámetros y haz clic en "Ejecutar Simulación" para comenzar
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
