import type { Categoria, Producto } from './catalogo'
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

export type SegmentoCompradorReporte = 'convencional' | 'pyme-vigente'

export interface VentaReporteDemo {
  readonly categoriaId: EntityId
  readonly comprador: SegmentoCompradorReporte
  readonly fecha: IsoDateTime
  readonly ingreso: MontoColones
  readonly productoId: EntityId
  readonly unidades: number
  readonly ventaId: EntityId
}

export interface DatasetReporteVentas {
  readonly categorias: readonly Categoria[]
  readonly demostrativo: true
  readonly generadoEn: IsoDateTime
  readonly productos: readonly Producto[]
  readonly ventas: readonly VentaReporteDemo[]
}

export type TrimestreReporte = 1 | 2 | 3 | 4

export interface FiltroReporteVentas {
  readonly anio: number
  readonly mes?: number
  readonly periodo: TipoPeriodoReporte
  readonly trimestre?: TrimestreReporte
}

export interface ResumenReporteVentas {
  readonly distribucionCompradores: DistribucionCompradores
  readonly indicadores: IndicadoresVentas
  readonly productosBajoInventario: readonly EntityId[]
  readonly productosMasVendidos: readonly RendimientoProducto[]
  readonly productosMenosVendidos: readonly RendimientoProducto[]
  readonly tendencia: readonly PuntoTendenciaVentas[]
  readonly ventasFiltradas: readonly VentaReporteDemo[]
  readonly ventasPorCategoria: readonly VentasPorCategoria[]
}
