from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import numpy as np

app = FastAPI()

class ParametroEntrada(BaseModel):
    monto_inicial: float = Field(..., gt=0)
    volatilidad_anual: float = Field(..., ge=0, le=200)
    horizonte_temporal: int = Field(..., ge=1, le=365)
    cantidad_iteraciones: int = Field(..., ge=100, le=10000)

class SalidaAnalisis(BaseModel):
    trayectorias: List[List[float]]
    media_movil: List[float]
    cuantil_bajo: List[float]
    cuantil_alto: List[float]
    valor_terminal_esperado: float
    valor_terminal_minimo: float
    valor_terminal_maximo: float
    perdida_maxima_confianza_95: float
    perdida_porcentual: float

def generar_movimientos_estocasticos(valor_base, volat, pasos_tiempo, num_trayectorias):
    vol_diaria = volat / 100 / np.sqrt(252)
    tasa_interes = 0.0
    delta_tiempo = 1 / 252
    
    matriz_precios = np.ones((num_trayectorias, pasos_tiempo + 1)) * valor_base
    
    for paso in range(1, pasos_tiempo + 1):
        ruido = np.random.standard_normal(num_trayectorias)
        exponencial = (tasa_interes - 0.5 * vol_diaria**2) * delta_tiempo
        gaussiano = vol_diaria * np.sqrt(delta_tiempo) * ruido
        matriz_precios[:, paso] = matriz_precios[:, paso-1] * np.exp(exponencial + gaussiano)
    
    media = np.mean(matriz_precios, axis=0)
    q_5 = np.percentile(matriz_precios, 5, axis=0)
    q_95 = np.percentile(matriz_precios, 95, axis=0)
    
    return matriz_precios, media, q_5, q_95

def calcular_metrica_riesgo(valores_finales, valor_inicial):
    cambios_porcentuales = (valores_finales - valor_inicial) / valor_inicial
    percentil_riesgo = np.percentile(cambios_porcentuales, 5)
    valor_en_riesgo = valor_inicial * abs(percentil_riesgo)
    porcentaje_riesgo = percentil_riesgo * 100
    return valor_en_riesgo, porcentaje_riesgo

def validar_entrada(param):
    if param.monto_inicial <= 0:
        raise HTTPException(status_code=400, detail="Monto debe ser positivo")
    if not (0 <= param.volatilidad_anual <= 200):
        raise HTTPException(status_code=400, detail="Volatilidad debe estar 0-200%")
    if not (1 <= param.horizonte_temporal <= 365):
        raise HTTPException(status_code=400, detail="Horizonte debe estar 1-365 días")
    if not (100 <= param.cantidad_iteraciones <= 10000):
        raise HTTPException(status_code=400, detail="Iteraciones debe estar 100-10000")

@app.post("/api/simular", response_model=SalidaAnalisis)
async def ejecutar_analisis(entrada: ParametroEntrada):
    validar_entrada(entrada)
    
    matriz, media, q5, q95 = generar_movimientos_estocasticos(
        entrada.monto_inicial,
        entrada.volatilidad_anual,
        entrada.horizonte_temporal,
        entrada.cantidad_iteraciones
    )
    
    valores_fin = matriz[:, -1]
    riesgo_abs, riesgo_pct = calcular_metrica_riesgo(valores_fin, entrada.monto_inicial)
    
    return SalidaAnalisis(
        trayectorias=matriz.tolist(),
        media_movil=media.tolist(),
        cuantil_bajo=q5.tolist(),
        cuantil_alto=q95.tolist(),
        valor_terminal_esperado=float(np.mean(valores_fin)),
        valor_terminal_minimo=float(np.min(valores_fin)),
        valor_terminal_maximo=float(np.max(valores_fin)),
        perdida_maxima_confianza_95=float(riesgo_abs),
        perdida_porcentual=float(riesgo_pct)
    )
