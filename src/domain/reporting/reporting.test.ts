import { describe, expect, it } from 'vitest'
import { categorias, productos, ventasReporteDemo } from '../../mocks/fixtures'
import type { DatasetReporteVentas } from '../types'
import { buildSalesReport, filterSalesByPeriod, getReportYears } from './reporting'

const dataset: DatasetReporteVentas = {
  categorias,
  demostrativo: true,
  generadoEn: '2026-11-07T20:00:00.000Z',
  productos,
  ventas: ventasReporteDemo,
}

describe('reportería de ventas', () => {
  it('filtra año completo, meses y Q1-Q4 usando fechas del dataset', () => {
    expect(filterSalesByPeriod(dataset.ventas, { anio: 2026, periodo: 'anual' })).toHaveLength(11)
    expect(filterSalesByPeriod(dataset.ventas, { anio: 2026, periodo: 'mensual', mes: 7 })).toHaveLength(2)
    expect(filterSalesByPeriod(dataset.ventas, { anio: 2026, periodo: 'trimestral', trimestre: 1 })).toHaveLength(3)
    expect(filterSalesByPeriod(dataset.ventas, { anio: 2026, periodo: 'trimestral', trimestre: 4 })).toHaveLength(3)
    expect(filterSalesByPeriod(dataset.ventas, { anio: 2026, periodo: 'trimestral', trimestre: 3 })).toHaveLength(3)
    expect(filterSalesByPeriod(dataset.ventas, { anio: 2026, periodo: 'mensual', mes: 12 })).toEqual([])
  })

  it('calcula KPIs coherentes para Q4 2026', () => {
    const report = buildSalesReport(dataset, { anio: 2026, periodo: 'trimestral', trimestre: 4 })
    expect(report.indicadores).toEqual({
      cantidadVentas: 2,
      ingresos: 99_300,
      ticketPromedio: 49_650,
      unidadesVendidas: 3,
    })
    expect(report.distribucionCompradores).toEqual({ convencionales: 1, pymeVigente: 1 })
  })

  it('deriva rankings consistentes y conserva productos sin ventas en menor rotación', () => {
    const report = buildSalesReport(dataset, { anio: 2026, periodo: 'anual' })
    expect(report.indicadores).toEqual({
      cantidadVentas: 8,
      ingresos: 596_400,
      ticketPromedio: 74_550,
      unidadesVendidas: 14,
    })
    expect(report.productosMasVendidos[0]).toMatchObject({ productoId: 'demo-producto-teclado-mecanico', unidades: 5 })
    expect(report.productosMenosVendidos[0]).toMatchObject({ productoId: 'demo-producto-webcam-full-hd', unidades: 1 })
    expect(report.productosBajoInventario).toEqual(expect.arrayContaining(['demo-producto-monitor-27', 'demo-producto-webcam-full-hd']))
  })

  it('retorna indicadores en cero y años ordenados cuando no hay ventas', () => {
    const report = buildSalesReport(dataset, { anio: 2024, periodo: 'anual' })
    expect(report.ventasFiltradas).toEqual([])
    expect(report.indicadores).toEqual({ cantidadVentas: 0, ingresos: 0, ticketPromedio: 0, unidadesVendidas: 0 })
    expect(getReportYears(dataset.ventas)).toEqual([2026, 2025])
  })
})
