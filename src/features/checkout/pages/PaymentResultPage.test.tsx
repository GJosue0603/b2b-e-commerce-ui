import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderTestApp } from '../../../test/renderApp'

describe('PaymentResultPage', () => {
  it('muestra verificación y crea pedido únicamente al aprobar', async () => {
    const { services } = renderTestApp(
      '/pago/resultado?resultado=aprobado',
      'buyer-regular',
      { latencyMs: 25 },
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Verificando transacción simulada',
      }),
    ).toBeVisible()
    expect(
      await screen.findByRole('heading', {
        name: 'Compra demostrativa confirmada',
      }),
    ).toBeVisible()
    expect(screen.getByText('ID de pedido demo')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Carrito, 0 productos' })).toBeVisible()
    const orders = await services.commerce.listOrdersByUser(
      'demo-usuario-comprador-regular',
    )
    expect(orders.some((order) => order.id.startsWith('demo-pedido-demo-pago-'))).toBe(true)
  })

  it.each([
    ['rechazado', 'La transacción simulada fue rechazada'],
    ['cancelado', 'Cancelaste la simulación'],
  ] as const)(
    'preserva el carrito y oculta el ID de pedido para %s',
    async (outcome, title) => {
      renderTestApp(`/pago/resultado?resultado=${outcome}`, 'buyer-regular')

      expect(await screen.findByRole('heading', { name: title })).toBeVisible()
      expect(screen.queryByText('ID de pedido demo')).toBeNull()
      expect(screen.getByRole('link', { name: 'Carrito, 2 productos' })).toBeVisible()
      expect(screen.getByRole('link', { name: 'Reintentar' })).toBeVisible()
    },
  )
})
