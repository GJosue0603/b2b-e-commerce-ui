import { useEffect, useMemo, useState } from 'react'
import { useAppServices } from '../../../app/services'
import {
  buildSalesReport,
  getReportYears,
  type DatasetReporteVentas,
  type FiltroReporteVentas,
  type TrimestreReporte,
} from '../../../domain'
import type { AsyncState } from '../../../services'
import { Alert, EmptyState, KpiCard, Skeleton } from '../../../shared/ui'
import { formatCRC } from '../../../shared/utils/pricing'
import {
  AccessibleBarChart,
  ChartCard,
  LowStockTable,
  Rankings,
  ReportFilterBar,
} from '../components'
import './sales-dashboard.css'

function defaultFilter(dataset: DatasetReporteVentas): FiltroReporteVentas {
  const reference = new Date(dataset.generadoEn)
  const years = getReportYears(dataset.ventas)
  const year = years.includes(reference.getUTCFullYear())
    ? reference.getUTCFullYear()
    : (years[0] ?? reference.getUTCFullYear())
  return {
    anio: year,
    periodo: 'trimestral',
    trimestre: (Math.floor(reference.getUTCMonth() / 3) + 1) as TrimestreReporte,
  }
}

export function SalesDashboardPage() {
  const { reports } = useAppServices()
  const [state, setState] = useState<AsyncState<DatasetReporteVentas>>({ status: 'loading' })
  const [chosenFilter, setChosenFilter] = useState<FiltroReporteVentas | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void reports.getSalesDataset({ signal: controller.signal })
      .then((dataset) => setState({ status: 'success', data: dataset }))
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', error: reason instanceof Error ? reason : new Error('No se pudo cargar el reporte.') })
      })
    return () => controller.abort()
  }, [reports])

  const dataset = state.status === 'success' ? state.data : null
  const filter = dataset ? (chosenFilter ?? defaultFilter(dataset)) : null
  const summary = useMemo(
    () => dataset && filter ? buildSalesReport(dataset, filter) : null,
    [dataset, filter],
  )

  if (state.status === 'loading') {
    return <div aria-label="Cargando reporte de ventas" className="sales-dashboard"><Skeleton height="30rem" /></div>
  }
  if (state.status === 'error' || !dataset || !filter || !summary) {
    return <Alert title="No pudimos cargar el reporte" variant="danger">Intenta nuevamente dentro de unos instantes.</Alert>
  }

  const productNames = new Map(dataset.productos.map((product) => [product.id, product.nombre]))
  const categoryNames = new Map(dataset.categorias.map((category) => [category.id, category.nombre]))
  const mapRanking = (items: typeof summary.productosMasVendidos) => items.map((item) => ({
    id: item.productoId,
    ingresos: item.ingresos,
    nombre: productNames.get(item.productoId) ?? 'Producto no disponible',
    unidades: item.unidades,
  }))
  const lowStockIds = new Set(summary.productosBajoInventario)
  const lowStockProducts = dataset.productos.filter((product) => lowStockIds.has(product.id))
  const totalBuyers = summary.distribucionCompradores.convencionales + summary.distribucionCompradores.pymeVigente

  return (
    <section className="sales-dashboard">
      <header className="sales-dashboard__header">
        <div>
          <span>Entorno de demostración</span>
          <h1>Análisis de ventas</h1>
          <p>Indicadores ficticios para evaluar el dashboard; no corresponden a transacciones financieras reales.</p>
        </div>
      </header>

      <ReportFilterBar filter={filter} onChange={setChosenFilter} years={getReportYears(dataset.ventas)} />

      <div className="sales-dashboard__kpis">
        <KpiCard detail="Órdenes demo confirmadas" label="Cantidad de ventas" value={summary.indicadores.cantidadVentas} />
        <KpiCard detail="Colones costarricenses" label="Ingresos" tone="success" value={formatCRC(summary.indicadores.ingresos)} />
        <KpiCard detail="Artículos vendidos" label="Unidades" value={summary.indicadores.unidadesVendidas} />
        <KpiCard detail="Promedio por orden" label="Ticket promedio" value={formatCRC(summary.indicadores.ticketPromedio)} />
      </div>

      {summary.ventasFiltradas.length === 0 ? (
        <EmptyState description="El dataset demostrativo no contiene ventas para el período seleccionado. Prueba otro año, mes o trimestre." title="Sin datos para este período" />
      ) : (
        <>
          <div className="sales-dashboard__charts">
            <ChartCard
              description={`${summary.indicadores.cantidadVentas} ventas generaron ${formatCRC(summary.indicadores.ingresos)} en el período.`}
              legend={<span><i aria-hidden="true" /> Ingresos demo</span>}
              title="Tendencia temporal de ingresos"
            >
              <AccessibleBarChart items={summary.tendencia.map((point) => ({ label: point.etiqueta, value: point.ingresos, valueLabel: formatCRC(point.ingresos) }))} />
            </ChartCard>
            <ChartCard
              description="Comparación de ingresos y unidades vendidas por categoría activa en el período."
              title="Ventas por categoría"
            >
              <AccessibleBarChart items={summary.ventasPorCategoria.map((item) => ({ label: categoryNames.get(item.categoriaId) ?? 'Sin categoría', value: item.ingresos, valueLabel: `${formatCRC(item.ingresos)} · ${item.unidades} uds.` }))} />
            </ChartCard>
          </div>

          <div className="sales-dashboard__secondary">
            <Rankings items={mapRanking(summary.productosMasVendidos)} title="Top 5 más vendidos" />
            <Rankings items={mapRanking(summary.productosMenosVendidos)} title="5 productos con menor rotación" />
            <ChartCard
              description={`${totalBuyers} compradores demo agrupados según la acreditación vigente al momento de la compra.`}
              legend={<><span><i aria-hidden="true" /> Convencional</span><span><i aria-hidden="true" className="chart-card__legend-dot--accent" /> PYME vigente</span></>}
              title="Tipo de comprador"
            >
              <AccessibleBarChart items={[
                { label: 'Comprador convencional', value: summary.distribucionCompradores.convencionales, valueLabel: `${summary.distribucionCompradores.convencionales} ventas` },
                { label: 'PYME vigente', value: summary.distribucionCompradores.pymeVigente, valueLabel: `${summary.distribucionCompradores.pymeVigente} ventas` },
              ]} />
            </ChartCard>
          </div>
        </>
      )}

      <section className="sales-dashboard__inventory">
        <div>
          <h2>Productos con bajo inventario</h2>
          <p>Estado actual del catálogo mock, actualizado desde la misma fuente compartida.</p>
        </div>
        <LowStockTable categories={dataset.categorias} products={lowStockProducts} />
      </section>
    </section>
  )
}
