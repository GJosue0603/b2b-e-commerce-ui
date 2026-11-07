import type { ReporteVentas } from '../../domain'
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
