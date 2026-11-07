import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DemoSessionProvider } from '../../../app/demoSession'
import { routeDefinitions } from '../../../app/router/routes'
import { AppServicesProvider } from '../../../app/services'
import { createMockServices } from '../../../mocks/repositories'
import type { DemoScenarioId } from '../../../services'
import { CartProvider } from '../state'

function renderBuyerCart(scenarioId: DemoScenarioId = 'buyer-regular') {
  const router = createMemoryRouter(routeDefinitions, {
    initialEntries: ['/carrito'],
  })
  render(
    <AppServicesProvider services={createMockServices({ latencyMs: 0 })}>
      <DemoSessionProvider initialScenarioId={scenarioId}>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </DemoSessionProvider>
    </AppServicesProvider>,
  )
}

describe('CartPage', () => {
  it('muestra filas únicas, miniaturas y resumen regular', async () => {
    renderBuyerCart()

    expect(await screen.findAllByRole('article')).toHaveLength(2)
    expect(
      screen.getByRole('heading', { name: 'Teclado mecánico inalámbrico' }),
    ).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Mouse ergonómico' })).toBeVisible()
    expect(document.body.textContent).toContain('₡61.800')
    expect(screen.queryByText('Ahorro PYME')).toBeNull()
    expect(screen.getByRole('link', { name: 'Continuar al pago' })).toBeVisible()
  })

  it('muestra subtotal regular, ahorro y total para PYME vigente', async () => {
    renderBuyerCart('buyer-pyme-active')

    await screen.findAllByRole('article')
    expect(screen.getByText('Subtotal regular (2)')).toBeVisible()
    expect(document.body.textContent).toContain('₡61.800')
    expect(screen.getByText('Ahorro PYME')).toBeVisible()
    expect(document.body.textContent).toContain('−₡5.400')
    expect(document.body.textContent).toContain('₡56.400')
  })

  it('actualiza cantidad en el mismo estado que alimenta el Header', async () => {
    const user = userEvent.setup()
    renderBuyerCart()
    const title = await screen.findByRole('heading', {
      name: 'Teclado mecánico inalámbrico',
    })
    const row = title.closest('article')
    if (!row) throw new Error('No se encontró la fila del teclado.')

    await user.click(
      within(row).getByRole('button', { name: 'Aumentar cantidad' }),
    )

    expect(
      screen.getByRole('link', { name: 'Carrito, 3 productos' }),
    ).toBeVisible()
    expect(
      within(row).getByRole('spinbutton', {
        name: 'Cantidad de Teclado mecánico inalámbrico',
      }),
    ).toHaveValue(2)
  })

  it('al eliminar el último elemento muestra EmptyState y bloquea checkout', async () => {
    const user = userEvent.setup()
    renderBuyerCart()
    await screen.findAllByRole('article')

    await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[0]!)
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(
      await screen.findByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeVisible()
    expect(screen.queryByRole('link', { name: 'Continuar al pago' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Carrito, 0 productos' })).toBeVisible()
  })
})
