import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppServicesProvider } from '../../../app/services'
import { createMockServices } from '../../../mocks/repositories'
import { CatalogPage } from './CatalogPage'

function renderCatalog(initialEntry = '/catalogo') {
  const router = createMemoryRouter(
    [{ path: '/catalogo', element: <CatalogPage /> }],
    { initialEntries: [initialEntry] },
  )

  render(
    <AppServicesProvider services={createMockServices({ latencyMs: 0 })}>
      <RouterProvider router={router} />
    </AppServicesProvider>,
  )
  return router
}

describe('CatalogPage', () => {
  it('muestra contador, cuatro cards y paginación', async () => {
    renderCatalog()

    expect(await screen.findAllByRole('article')).toHaveLength(4)
    expect(screen.getByText('5 productos encontrados')).toBeVisible()
    expect(
      screen.getByRole('navigation', { name: 'Paginación del catálogo' }),
    ).toBeVisible()
  })

  it('combina filtros desde la UI y actualiza la URL', async () => {
    const user = userEvent.setup()
    const router = renderCatalog()
    const availability = (await screen.findAllByLabelText('Disponibilidad'))[0]
    if (!availability) throw new Error('No se encontró el filtro de disponibilidad.')

    await user.selectOptions(availability, 'out-of-stock')

    expect(await screen.findByText('1 producto encontrado')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Monitor de 27 pulgadas' })).toBeVisible()
    expect(router.state.location.search).toContain(
      'disponibilidad=out-of-stock',
    )
  })

  it('conserva la búsqueda al paginar', async () => {
    const user = userEvent.setup()
    const router = renderCatalog('/catalogo?q=o')
    await screen.findByText('5 productos encontrados')

    await user.click(screen.getByRole('button', { name: 'Ir a la página 2' }))

    expect(router.state.location.search).toContain('q=o')
    expect(router.state.location.search).toContain('pagina=2')
    expect(await screen.findAllByRole('article')).toHaveLength(1)
  })

  it('muestra empty state para una búsqueda sin resultados', async () => {
    renderCatalog('/catalogo?q=producto-inexistente')

    expect(
      await screen.findByRole('heading', { name: 'No encontramos productos' }),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeEnabled()
  })

  it('abre los filtros móviles en un drawer dialog', async () => {
    const user = userEvent.setup()
    renderCatalog()
    await screen.findByText('5 productos encontrados')

    await user.click(screen.getByRole('button', { name: 'Filtros' }))

    expect(
      screen.getByRole('dialog', { name: 'Filtrar productos' }),
    ).toBeVisible()
  })
})
