import type { ReporteVentas, VentaReporteDemo } from '../../domain'
import { fixtureIds } from './ids'

export const reportes = [
  {
    id: fixtureIds.reports.sales,
    periodo: {
      tipo: 'trimestral',
      etiqueta: 'Q4 2026 - demostración',
      fechaInicio: '2026-10-01T00:00:00.000Z',
      fechaFin: '2026-12-31T23:59:59.000Z',
    },
    indicadores: {
      cantidadVentas: 2,
      ingresos: 118_200,
      unidadesVendidas: 4,
      ticketPromedio: 59_100,
    },
    tendencia: [
      { etiqueta: 'Octubre', ventas: 1, ingresos: 61_800 },
      { etiqueta: 'Noviembre', ventas: 1, ingresos: 56_400 },
      { etiqueta: 'Diciembre', ventas: 0, ingresos: 0 },
    ],
    ventasPorCategoria: [
      {
        categoriaId: fixtureIds.categories.office,
        unidades: 4,
        ingresos: 118_200,
      },
    ],
    productosMasVendidos: [
      {
        productoId: fixtureIds.products.keyboard,
        unidades: 2,
        ingresos: 82_800,
      },
      {
        productoId: fixtureIds.products.mouse,
        unidades: 2,
        ingresos: 35_400,
      },
    ],
    productosMenosVendidos: [
      {
        productoId: fixtureIds.products.monitor,
        unidades: 0,
        ingresos: 0,
      },
      {
        productoId: fixtureIds.products.headphones,
        unidades: 0,
        ingresos: 0,
      },
      {
        productoId: fixtureIds.products.webcam,
        unidades: 0,
        ingresos: 0,
      },
    ],
    distribucionCompradores: {
      convencionales: 1,
      pymeVigente: 1,
    },
    productosBajoInventario: [
      fixtureIds.products.monitor,
      fixtureIds.products.webcam,
    ],
    generadoEn: '2026-11-06T13:00:00.000Z',
    demostrativo: true,
  },
] as const satisfies readonly ReporteVentas[]

/** Líneas de venta exclusivamente demostrativas para ejercitar filtros y agregaciones. */
export const ventasReporteDemo = [
  {
    ventaId: 'demo-venta-2025-01', fecha: '2025-01-15T16:00:00.000Z',
    comprador: 'convencional', productoId: fixtureIds.products.keyboard,
    categoriaId: fixtureIds.categories.office, unidades: 1, ingreso: 42_900,
  },
  {
    ventaId: 'demo-venta-2025-01', fecha: '2025-01-15T16:00:00.000Z',
    comprador: 'convencional', productoId: fixtureIds.products.mouse,
    categoriaId: fixtureIds.categories.office, unidades: 1, ingreso: 18_900,
  },
  {
    ventaId: 'demo-venta-2025-02', fecha: '2025-04-08T16:00:00.000Z',
    comprador: 'pyme-vigente', productoId: fixtureIds.products.monitor,
    categoriaId: fixtureIds.categories.monitors, unidades: 2, ingreso: 219_800,
  },
  {
    ventaId: 'demo-venta-2025-03', fecha: '2025-07-22T16:00:00.000Z',
    comprador: 'convencional', productoId: fixtureIds.products.headphones,
    categoriaId: fixtureIds.categories.audio, unidades: 1, ingreso: 34_900,
  },
  {
    ventaId: 'demo-venta-2025-04', fecha: '2025-10-10T16:00:00.000Z',
    comprador: 'pyme-vigente', productoId: fixtureIds.products.webcam,
    categoriaId: fixtureIds.categories.video, unidades: 3, ingreso: 68_700,
  },
  {
    ventaId: 'demo-venta-2026-01', fecha: '2026-01-12T16:00:00.000Z',
    comprador: 'convencional', productoId: fixtureIds.products.keyboard,
    categoriaId: fixtureIds.categories.office, unidades: 1, ingreso: 42_900,
  },
  {
    ventaId: 'demo-venta-2026-01', fecha: '2026-01-12T16:00:00.000Z',
    comprador: 'convencional', productoId: fixtureIds.products.mouse,
    categoriaId: fixtureIds.categories.office, unidades: 1, ingreso: 18_900,
  },
  {
    ventaId: 'demo-venta-2026-02', fecha: '2026-02-18T16:00:00.000Z',
    comprador: 'pyme-vigente', productoId: fixtureIds.products.keyboard,
    categoriaId: fixtureIds.categories.office, unidades: 2, ingreso: 79_800,
  },
  {
    ventaId: 'demo-venta-2026-03', fecha: '2026-04-04T16:00:00.000Z',
    comprador: 'convencional', productoId: fixtureIds.products.monitor,
    categoriaId: fixtureIds.categories.monitors, unidades: 1, ingreso: 119_900,
  },
  {
    ventaId: 'demo-venta-2026-04', fecha: '2026-05-21T16:00:00.000Z',
    comprador: 'pyme-vigente', productoId: fixtureIds.products.headphones,
    categoriaId: fixtureIds.categories.audio, unidades: 2, ingreso: 63_000,
  },
  {
    ventaId: 'demo-venta-2026-05', fecha: '2026-07-09T16:00:00.000Z',
    comprador: 'convencional', productoId: fixtureIds.products.mouse,
    categoriaId: fixtureIds.categories.office, unidades: 2, ingreso: 37_800,
  },
  {
    ventaId: 'demo-venta-2026-05', fecha: '2026-07-09T16:00:00.000Z',
    comprador: 'convencional', productoId: fixtureIds.products.webcam,
    categoriaId: fixtureIds.categories.video, unidades: 1, ingreso: 24_900,
  },
  {
    ventaId: 'demo-venta-2026-06', fecha: '2026-08-14T16:00:00.000Z',
    comprador: 'pyme-vigente', productoId: fixtureIds.products.monitor,
    categoriaId: fixtureIds.categories.monitors, unidades: 1, ingreso: 109_900,
  },
  {
    ventaId: 'demo-venta-2026-07', fecha: '2026-10-19T16:00:00.000Z',
    comprador: 'convencional', productoId: fixtureIds.products.keyboard,
    categoriaId: fixtureIds.categories.office, unidades: 1, ingreso: 42_900,
  },
  {
    ventaId: 'demo-venta-2026-08', fecha: '2026-11-06T16:00:00.000Z',
    comprador: 'pyme-vigente', productoId: fixtureIds.products.keyboard,
    categoriaId: fixtureIds.categories.office, unidades: 1, ingreso: 39_900,
  },
  {
    ventaId: 'demo-venta-2026-08', fecha: '2026-11-06T16:00:00.000Z',
    comprador: 'pyme-vigente', productoId: fixtureIds.products.mouse,
    categoriaId: fixtureIds.categories.office, unidades: 1, ingreso: 16_500,
  },
] as const satisfies readonly VentaReporteDemo[]
