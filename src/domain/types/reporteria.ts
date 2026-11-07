import type { EntityId, IsoDateTime, MontoColones } from './common'

export type TipoPeriodoReporte = 'mensual' | 'trimestral' | 'anual'

export interface PeriodoReporte {
  readonly tipo: TipoPeriodoReporte
  readonly etiqueta: string
  readonly fechaInicio: IsoDateTime
  readonly fechaFin: IsoDateTime
}

export interface IndicadoresVentas {
  readonly cantidadVentas: number
  readonly ingresos: MontoColones
  readonly unidadesVendidas: number
  readonly ticketPromedio: MontoColones
}

export interface PuntoTendenciaVentas {
  readonly etiqueta: string
  readonly ventas: number
  readonly ingresos: MontoColones
}

export interface VentasPorCategoria {
  readonly categoriaId: EntityId
  readonly unidades: number
  readonly ingresos: MontoColones
}

export interface RendimientoProducto {
  readonly productoId: EntityId
  readonly unidades: number
  readonly ingresos: MontoColones
}

export interface DistribucionCompradores {
  readonly convencionales: number
  readonly pymeVigente: number
}

export interface ReporteVentas {
  readonly id: EntityId
  readonly periodo: PeriodoReporte
  readonly indicadores: IndicadoresVentas
  readonly tendencia: readonly PuntoTendenciaVentas[]
  readonly ventasPorCategoria: readonly VentasPorCategoria[]
  readonly productosMasVendidos: readonly RendimientoProducto[]
  readonly productosMenosVendidos: readonly RendimientoProducto[]
  readonly distribucionCompradores: DistribucionCompradores
  readonly productosBajoInventario: readonly EntityId[]
  readonly generadoEn: IsoDateTime
  readonly demostrativo: true
}
