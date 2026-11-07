import type {
  DatasetReporteVentas,
  FiltroReporteVentas,
  PuntoTendenciaVentas,
  RendimientoProducto,
  ResumenReporteVentas,
  VentaReporteDemo,
  VentasPorCategoria,
} from '../types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const

function monthName(index: number) {
  return MONTH_NAMES[index] ?? 'Mes'
}

function saleDate(sale: VentaReporteDemo) {
  return new Date(sale.fecha)
}

export function filterSalesByPeriod(
  sales: readonly VentaReporteDemo[],
  filter: FiltroReporteVentas,
) {
  return sales.filter((sale) => {
    const date = saleDate(sale)
    if (date.getUTCFullYear() !== filter.anio) return false
    if (filter.periodo === 'mensual') {
      return date.getUTCMonth() + 1 === (filter.mes ?? 1)
    }
    if (filter.periodo === 'trimestral') {
      const quarter = Math.floor(date.getUTCMonth() / 3) + 1
      return quarter === (filter.trimestre ?? 1)
    }
    return true
  })
}

function groupOrderTotals(sales: readonly VentaReporteDemo[]) {
  const totals = new Map<string, number>()
  for (const sale of sales) {
    totals.set(sale.ventaId, (totals.get(sale.ventaId) ?? 0) + sale.ingreso)
  }
  return totals
}

function buildTrend(
  sales: readonly VentaReporteDemo[],
  filter: FiltroReporteVentas,
): readonly PuntoTendenciaVentas[] {
  const buckets = new Map<string, PuntoTendenciaVentas>()
  for (const sale of sales) {
    const date = saleDate(sale)
    const key = filter.periodo === 'mensual'
      ? date.toISOString().slice(0, 10)
      : `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    const label = filter.periodo === 'mensual'
      ? `${date.getUTCDate()} ${monthName(date.getUTCMonth()).slice(0, 3).toLocaleLowerCase('es')}`
      : monthName(date.getUTCMonth())
    const previous = buckets.get(key)
    buckets.set(key, {
      etiqueta: label,
      ingresos: (previous?.ingresos ?? 0) + sale.ingreso,
      ventas: previous?.ventas ?? 0,
    })
  }

  for (const [key, point] of buckets) {
    const uniqueOrders = new Set(
      sales
        .filter((sale) => {
          const date = saleDate(sale)
          const saleKey = filter.periodo === 'mensual'
            ? date.toISOString().slice(0, 10)
            : `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
          return saleKey === key
        })
        .map((sale) => sale.ventaId),
    )
    buckets.set(key, { ...point, ventas: uniqueOrders.size })
  }
  return [...buckets.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, value]) => value)
}

function aggregateBy<T extends string>(
  sales: readonly VentaReporteDemo[],
  keyOf: (sale: VentaReporteDemo) => T,
) {
  const result = new Map<T, { ingresos: number; unidades: number }>()
  for (const sale of sales) {
    const key = keyOf(sale)
    const previous = result.get(key)
    result.set(key, {
      ingresos: (previous?.ingresos ?? 0) + sale.ingreso,
      unidades: (previous?.unidades ?? 0) + sale.unidades,
    })
  }
  return result
}

export function buildSalesReport(
  dataset: DatasetReporteVentas,
  filter: FiltroReporteVentas,
): ResumenReporteVentas {
  const sales = filterSalesByPeriod(dataset.ventas, filter)
  const orderTotals = groupOrderTotals(sales)
  const income = sales.reduce((total, sale) => total + sale.ingreso, 0)
  const units = sales.reduce((total, sale) => total + sale.unidades, 0)
  const categoryTotals = aggregateBy(sales, (sale) => sale.categoriaId)
  const productTotals = aggregateBy(sales, (sale) => sale.productoId)
  const performance = dataset.productos
    .filter((product) => product.activo)
    .map<RendimientoProducto>((product) => ({
      productoId: product.id,
      ingresos: productTotals.get(product.id)?.ingresos ?? 0,
      unidades: productTotals.get(product.id)?.unidades ?? 0,
    }))
  const orderSegments = new Map<string, VentaReporteDemo['comprador']>()
  for (const sale of sales) orderSegments.set(sale.ventaId, sale.comprador)

  const categoryPerformance = [...categoryTotals.entries()]
    .map<VentasPorCategoria>(([categoriaId, totals]) => ({ categoriaId, ...totals }))
    .sort((left, right) => right.ingresos - left.ingresos)

  return {
    distribucionCompradores: {
      convencionales: [...orderSegments.values()].filter((segment) => segment === 'convencional').length,
      pymeVigente: [...orderSegments.values()].filter((segment) => segment === 'pyme-vigente').length,
    },
    indicadores: {
      cantidadVentas: orderTotals.size,
      ingresos: income,
      ticketPromedio: orderTotals.size === 0 ? 0 : Math.round(income / orderTotals.size),
      unidadesVendidas: units,
    },
    productosBajoInventario: dataset.productos
      .filter((product) => product.activo && product.existencias <= 5)
      .map((product) => product.id),
    productosMasVendidos: [...performance]
      .sort((left, right) => right.unidades - left.unidades || right.ingresos - left.ingresos)
      .slice(0, 5),
    productosMenosVendidos: [...performance]
      .sort((left, right) => left.unidades - right.unidades || left.ingresos - right.ingresos)
      .slice(0, 5),
    tendencia: buildTrend(sales, filter),
    ventasFiltradas: sales,
    ventasPorCategoria: categoryPerformance,
  }
}

export function getReportYears(sales: readonly VentaReporteDemo[]) {
  return [...new Set(sales.map((sale) => saleDate(sale).getUTCFullYear()))]
    .sort((left, right) => right - left)
}
