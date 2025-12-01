import { type NextRequest, NextResponse } from "next/server"

interface ParametrosSimulacion {
  monto_inicial: number
  volatilidad_anual: number
  horizonte_temporal: number
  cantidad_iteraciones: number
}

interface ResultadoSimulacion {
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

function validarParametros(params: ParametrosSimulacion): { valido: boolean; error?: string } {
  console.log("[v0] Parámetros recibidos:", params)

  if (!params.monto_inicial || params.monto_inicial <= 0) {
    return { valido: false, error: "El precio debe ser mayor a 0" }
  }
  if (params.volatilidad_anual === undefined || params.volatilidad_anual < 0 || params.volatilidad_anual > 200) {
    return { valido: false, error: "La volatilidad debe estar entre 0 y 200%" }
  }
  if (!params.horizonte_temporal || params.horizonte_temporal < 1 || params.horizonte_temporal > 365) {
    return { valido: false, error: "Los días deben estar entre 1 y 365" }
  }
  if (!params.cantidad_iteraciones || params.cantidad_iteraciones < 100 || params.cantidad_iteraciones > 10000) {
    return { valido: false, error: "Las simulaciones deben estar entre 100 y 10000" }
  }

  // Validar que no causen overflow de memoria
  const memoriaAproximada = params.cantidad_iteraciones * (params.horizonte_temporal + 1) * 8
  const limiteMemoria = 50 * 1024 * 1024 // 50MB
  if (memoriaAproximada > limiteMemoria) {
    return { valido: false, error: "Combinación de parámetros consume demasiada memoria" }
  }

  return { valido: true }
}

function generarNumerosAleatorios(cantidad: number): number[] {
  const resultado: number[] = []
  for (let i = 0; i < cantidad; i++) {
    let u1 = 0,
      u2 = 0
    while (u1 === 0) u1 = Math.random()
    while (u2 === 0) u2 = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
    resultado.push(z)
  }
  return resultado
}

function calcularRandomWalk(
  precioInicial: number,
  volatilidad: number,
  dias: number,
  numSimulaciones: number,
): ResultadoSimulacion {
  try {
    console.log("[v0] Iniciando cálculo. Simulaciones:", numSimulaciones, "Días:", dias)

    // Convertir parámetros
    const volDiaria = volatilidad / 100 / Math.sqrt(252)
    const rfRate = 0.0
    const dt = 1 / 252

    if (numSimulaciones <= 0 || dias <= 0) {
      throw new Error("Simulaciones y días deben ser > 0")
    }

    // Inicializar matriz de simulaciones
    const simulaciones: number[][] = []
    for (let i = 0; i < numSimulaciones; i++) {
      simulaciones.push(Array(dias + 1).fill(precioInicial))
    }

    console.log("[v0] Matriz creada exitosamente")

    // Generar caminos aleatorios usando Movimiento Browniano Geométrico
    for (let t = 1; t <= dias; t++) {
      const z = generarNumerosAleatorios(numSimulaciones)

      for (let i = 0; i < numSimulaciones; i++) {
        simulaciones[i][t] =
          simulaciones[i][t - 1] * Math.exp((rfRate - 0.5 * volDiaria ** 2) * dt + volDiaria * Math.sqrt(dt) * z[i])
      }
    }

    // Calcular promedios
    const promedio: number[] = []
    for (let t = 0; t <= dias; t++) {
      let suma = 0
      for (let i = 0; i < numSimulaciones; i++) {
        suma += simulaciones[i][t]
      }
      promedio.push(suma / numSimulaciones)
    }

    // Calcular percentil 5 y 95
    const percentil5: number[] = []
    const percentil95: number[] = []

    for (let t = 0; t <= dias; t++) {
      const valores = simulaciones.map((sim) => sim[t]).sort((a, b) => a - b)
      percentil5.push(valores[Math.floor(numSimulaciones * 0.05)])
      percentil95.push(valores[Math.floor(numSimulaciones * 0.95)])
    }

    // Precios finales
    const preciosFinales = simulaciones.map((sim) => sim[dias])
    const precioFinalPromedio = preciosFinales.reduce((a, b) => a + b, 0) / numSimulaciones
    const precioFinalMinimo = Math.min(...preciosFinales)
    const precioFinalMaximo = Math.max(...preciosFinales)

    // Calcular VaR 95%
    const retornos = preciosFinales.map((precio) => (precio - precioInicial) / precioInicial)
    const retornosOrdenados = [...retornos].sort((a, b) => a - b)
    const var95Percentaje = retornosOrdenados[Math.floor(numSimulaciones * 0.05)]
    const var95Valor = precioInicial * Math.abs(var95Percentaje)

    console.log("[v0] Cálculo completado exitosamente")

    return {
      simulaciones,
      promedio,
      percentil_5: percentil5,
      percentil_95: percentil95,
      precio_final_promedio: precioFinalPromedio,
      precio_final_minimo: precioFinalMinimo,
      precio_final_maximo: precioFinalMaximo,
      var_95: var95Valor,
      var_percentaje: var95Percentaje * 100,
    }
  } catch (error) {
    console.error("[v0] Error en calcularRandomWalk:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Body recibido:", body)

    const validacion = validarParametros(body)
    if (!validacion.valido) {
      console.log("[v0] Validación fallida:", validacion.error)
      return NextResponse.json({ error: validacion.error }, { status: 400 })
    }

    const resultado = calcularRandomWalk(
      body.monto_inicial,
      body.volatilidad_anual,
      body.horizonte_temporal,
      body.cantidad_iteraciones,
    )

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("[v0] Error en simulación:", error)
    const mensajeError = error instanceof Error ? error.message : "Error procesando la simulación"
    return NextResponse.json({ error: mensajeError }, { status: 500 })
  }
}
