import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppServicesProvider } from '../../../app/services'
import { createMockServices } from '../../../mocks/repositories'
import { productos } from '../../../mocks/fixtures/productos'
import { ProductsPage } from './ProductsPage'

describe('paginación de productos', () => {
  it('distribuye 200 productos en ocho páginas y vuelve a la primera al filtrar', async () => {
    const services = createMockServices({ latencyMs: 0 })
    vi.spyOn(services.catalog, 'listManagedProducts').mockResolvedValue(
      Array.from({ length: 200 }, (_, i) => ({ ...productos[0], id: `producto-${i + 1}`, nombre: `Producto ${String(i + 1).padStart(3, '0')}` })),
    )
    const user = userEvent.setup()
    const router = createMemoryRouter([{ path: '*', element: <ProductsPage supervision /> }])
    render(<AppServicesProvider services={services}><RouterProvider router={router} /></AppServicesProvider>)
    await screen.findByText('Producto 001')
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(26)
    expect(screen.queryByText('Producto 026')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Ir a la página siguiente' }))
    expect(screen.getByText('Producto 026')).toBeVisible()
    expect(screen.queryByText('Producto 001')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Ir a la página 8' }))
    expect(screen.getByText('Producto 200')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Ir a la página siguiente' })).toBeDisabled()
    await user.type(screen.getByLabelText('Buscar productos'), 'Producto 001')
    expect(screen.getByText('Producto 001')).toBeVisible()
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2)
    expect(screen.getByText('Mostrando 1–1 de 1 productos')).toBeVisible()
  })
})
