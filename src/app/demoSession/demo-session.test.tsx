import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createMockServices } from '../../mocks/repositories'
import { CartProvider } from '../../features/cart/state'
import { AuthProvider } from '../../features/auth/state'
import { routeDefinitions } from '../router/routes'
import { AppServicesProvider } from '../services'
import { DemoSessionProvider } from './DemoSessionProvider'

function renderDemo(fail = false) {
  const router = createMemoryRouter(routeDefinitions, {
    initialEntries: ['/'],
  })
  const services = createMockServices({
    failOperations: fail
      ? ['demoSession.getByScenario', 'demoSession.listScenarios']
      : [],
    latencyMs: 0,
  })

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

describe('control de sesión demostrativa', () => {
  it('cambia a Administrador, navega y limita el sidebar al rol simulado', async () => {
    const user = userEvent.setup()
    const router = renderDemo()
    await user.click(await screen.findByText('Demo'))

    await user.selectOptions(
      screen.getByLabelText('Escenario de demostración'),
      'administrator',
    )

    expect(
      await screen.findByRole('heading', { name: 'Solicitudes PYME' }),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/admin/acreditaciones')

    const navigation = screen.getByRole('navigation', {
      name: 'Navegación de Administrador',
    })
    expect(within(navigation).getByRole('link', { name: 'Pedidos' })).toBeVisible()
    expect(within(navigation).queryByRole('link', { name: 'Categorías' })).toBeNull()
  })

  it('expone el estado de error simulado y permite reintentar', async () => {
    const user = userEvent.setup()
    renderDemo(true)
    await user.click(screen.getByText('Demo'))

    expect(await screen.findByText('No se pudo cargar la demo')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled()
  })

  it('muestra un solo Comprador PYME en el selector global', async () => {
    const user = userEvent.setup()
    renderDemo()
    await user.click(await screen.findByText('Demo'))
    const select = screen.getByLabelText('Escenario de demostración')

    expect(within(select).getByRole('option', { name: 'Comprador PYME' })).toBeVisible()
    expect(within(select).queryByRole('option', { name: /pendiente/i })).toBeNull()
    expect(within(select).queryByRole('option', { name: /rechazado/i })).toBeNull()
    expect(within(select).queryByRole('option', { name: /vencido/i })).toBeNull()
    expect(within(select).queryByRole('option', { name: /revocado/i })).toBeNull()
  })
})
