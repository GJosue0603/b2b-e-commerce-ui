import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppServicesProvider } from '../../../app/services'
import { DemoSessionProvider } from '../../../app/demoSession'
import { routeDefinitions } from '../../../app/router/routes'
import { createMockServices } from '../../../mocks/repositories'
import { AuthProvider } from '../../auth/state'
import { CartProvider } from './CartProvider'

function renderProductDetail() {
  const router = createMemoryRouter(routeDefinitions, {
    initialEntries: ['/producto/demo-producto-teclado-mecanico'],
  })
  render(
    <AppServicesProvider services={createMockServices({ latencyMs: 0 })}>
      <DemoSessionProvider>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </DemoSessionProvider>
    </AppServicesProvider>,
  )
}

describe('integración del carrito', () => {
  it('agrega la cantidad seleccionada y actualiza el contador del Header', async () => {
    const user = userEvent.setup()
    renderProductDetail()
    await screen.findByRole('link', { name: 'Carrito, 0 productos' })
    await screen.findByRole('heading', { name: 'Teclado mecánico inalámbrico' })

    await user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))

    expect(await screen.findByText('Carrito actualizado')).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Carrito, 2 productos' }),
    ).toBeVisible()
  })

  it('bloquea el CTA de un producto agotado', async () => {
    const router = createMemoryRouter(routeDefinitions, {
      initialEntries: ['/producto/demo-producto-monitor-27'],
    })
    render(
      <AppServicesProvider services={createMockServices({ latencyMs: 0 })}>
        <DemoSessionProvider>
          <AuthProvider>
            <CartProvider>
              <RouterProvider router={router} />
            </CartProvider>
          </AuthProvider>
        </DemoSessionProvider>
      </AppServicesProvider>,
    )

    expect(
      await screen.findByRole('button', { name: 'Agregar al carrito' }),
    ).toBeDisabled()
  })
})
