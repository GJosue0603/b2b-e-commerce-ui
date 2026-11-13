import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createMockServices } from '../../mocks/repositories'
import { CartProvider } from '../../features/cart/state'
import { AuthProvider } from '../../features/auth/state'
import { routeDefinitions } from '../router/routes'
import { AppServicesProvider } from '../services'
import { DemoSessionProvider } from './DemoSessionProvider'

function renderDemo() {
  const router = createMemoryRouter(routeDefinitions, {
    initialEntries: ['/'],
  })
  const services = createMockServices({ latencyMs: 0 })

  render(
    <AppServicesProvider services={services}>
      <DemoSessionProvider>
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

describe('sesión pública inicial', () => {
  it('abre el landing como visitante sin selector global de escenarios', async () => {
    const router = renderDemo()

    expect(
      await screen.findByRole('heading', {
        name: 'Tecnología para tu día a día y tu negocio',
      }),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/')
    expect(screen.queryByText('Sesión simulada')).toBeNull()
    expect(screen.queryByLabelText('Escenario de demostración')).toBeNull()
  })
})
