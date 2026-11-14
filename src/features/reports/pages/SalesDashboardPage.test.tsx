import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderTestApp } from '../../../test/renderApp'

describe('SalesDashboardPage compartido', () => {
  it('actualiza KPIs al cambiar de trimestre a año completo', async () => {
    const user = userEvent.setup()
    renderTestApp('/vendedor/reportes', 'seller')

    await screen.findByRole('heading', { name: 'Análisis de ventas' })
    const salesKpi = screen.getByText('Cantidad de ventas').closest('article')
    const incomeKpi = screen.getByText('Ingresos').closest('article')
    expect(salesKpi).not.toBeNull()
    expect(incomeKpi).not.toBeNull()
    expect(within(salesKpi!).getByText('2')).toBeVisible()
    expect(within(incomeKpi!).getByText('₡99.300')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Año completo' }))
    expect(within(salesKpi!).getByText('8')).toBeVisible()
    expect(within(incomeKpi!).getByText('₡596.400')).toBeVisible()
  })

  it('muestra estado sin datos para un mes vacío', async () => {
    const user = userEvent.setup()
    renderTestApp('/vendedor/reportes', 'seller')
    await screen.findByRole('heading', { name: 'Análisis de ventas' })

    await user.click(screen.getByRole('button', { name: 'Mensual' }))
    await user.selectOptions(screen.getByLabelText('Mes'), '12')
    expect(await screen.findByRole('heading', { name: 'Sin datos para este período' })).toBeVisible()
  })

  it('usa el mismo dashboard para Administrador en modo consulta', async () => {
    renderTestApp('/admin/reportes', 'administrator')
    expect(await screen.findByRole('heading', { name: 'Análisis de ventas' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Top 5 más vendidos' })).toBeVisible()
    expect(screen.queryByRole('button', { name: /guardar|editar|eliminar/i })).toBeNull()
  })
})
