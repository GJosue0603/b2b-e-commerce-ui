import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createMockServices } from '../../mocks/repositories'
import { CartProvider } from '../../features/cart/state'
import { AuthProvider } from '../../features/auth/state'
import type { DemoScenarioId } from '../../services'
import { DemoSessionProvider } from '../../app/demoSession'
import { routeDefinitions } from '../../app/router/routes'
import { AppServicesProvider } from '../../app/services'

function renderStore(initialScenarioId: DemoScenarioId = 'visitor') {
  const router = createMemoryRouter(routeDefinitions, {
    initialEntries: ['/'],
  })

  render(
    <AppServicesProvider services={createMockServices({ latencyMs: 0 })}>
      <DemoSessionProvider initialScenarioId={initialScenarioId}>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </DemoSessionProvider>
    </AppServicesProvider>,
  )

  return router
}

describe('StoreHeader', () => {
  it('inicia como visitante y ofrece ingreso y registro', async () => {
    renderStore()

    expect((await screen.findAllByRole('link', { name: 'Ingresar' })).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Registrarse' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: 'Mi cuenta' })).toBeNull()
  })

  it('busca en el catálogo mediante navegación cliente parametrizada', async () => {
    const user = userEvent.setup()
    const router = renderStore()
    const searchInputs = await screen.findAllByLabelText('Buscar productos')
    const searchInput = searchInputs[0]
    if (!searchInput) throw new Error('No se encontró el buscador de escritorio.')

    await user.type(searchInput, 'teclado mecánico{Enter}')

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Catálogo de Tecnología',
      }),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/catalogo')
    expect(new URLSearchParams(router.state.location.search).get('q')).toBe(
      'teclado mecánico',
    )
  })

  it('muestra la suma de unidades del carrito del comprador simulado', async () => {
    renderStore('buyer-regular')

    expect(
      await screen.findByRole('link', { name: 'Carrito, 2 productos' }),
    ).toBeVisible()
    expect(screen.getAllByText('Mi cuenta').length).toBeGreaterThan(0)
  })

  it('permite abrir el menú móvil utilizando el teclado', async () => {
    const user = userEvent.setup()
    renderStore()
    const menuButton = await screen.findByLabelText('Abrir menú')

    menuButton.focus()
    await user.keyboard('{Enter}')

    expect(menuButton.closest('details')).toHaveAttribute('open')
    expect(
      screen.getByRole('navigation', {
        name: 'Navegación móvil de la tienda',
      }),
    ).toBeVisible()
  })
})
