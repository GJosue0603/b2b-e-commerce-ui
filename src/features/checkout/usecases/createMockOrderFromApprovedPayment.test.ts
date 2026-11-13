import { describe, expect, it } from 'vitest'
import { createMockServices } from '../../../mocks/repositories'
import { createMockOrderFromApprovedPayment } from './createMockOrderFromApprovedPayment'

async function prepare(outcome: 'aprobado' | 'rechazado' | 'cancelado') {
  const services = createMockServices({ latencyMs: 0 })
  const session = await services.demoSession.getByScenario('buyer-regular')
  if (!session.user) throw new Error('El escenario no tiene comprador.')
  const cart = await services.commerce.getCartByUser(session.user.id)
  if (!cart) throw new Error('El escenario no tiene carrito.')
  const products = await services.catalog.listProducts()
  const pending = await services.paymentGateway.startPayment({
    amount: 61_800,
    attemptKey: `orden-${outcome}`,
    userId: session.user.id,
  })
  const resolved = await services.paymentGateway.resolvePayment(
    pending.payment.id,
    outcome,
  )
  return { cart, payment: resolved.payment, products, services }
}

describe('createMockOrderFromApprovedPayment', () => {
  it('crea snapshot, actualiza inventario/carrito y es idempotente', async () => {
    const { cart, payment, products, services } = await prepare('aprobado')
    const inventoryBefore = await services.catalog.listInventory()

    const first = await createMockOrderFromApprovedPayment({
      cartItems: cart.items,
      orders: services.orders,
      payment,
      products,
    })
    const repeated = await createMockOrderFromApprovedPayment({
      cartItems: cart.items,
      orders: services.orders,
      payment,
      products,
    })

    expect(first.kind).toBe('created')
    expect(repeated.kind).toBe('existing')
    expect(repeated.order?.id).toBe(first.order?.id)
    expect(first.order?.items[0]).toMatchObject({
      nombreProducto: 'Teclado mecánico inalámbrico',
      precioUnitario: 42_900,
      subtotal: 42_900,
    })
    expect((await services.commerce.getCartByUser(payment.usuarioId))?.items).toEqual([])
    const inventoryAfter = await services.catalog.listInventory()
    expect(inventoryAfter[0]!.existencias).toBe(
      inventoryBefore[0]!.existencias - 1,
    )
  })

  it.each(['rechazado', 'cancelado'] as const)(
    'no crea pedido ni modifica el carrito cuando el pago está %s',
    async (outcome) => {
      const { cart, payment, products, services } = await prepare(outcome)
      const inventoryBefore = await services.catalog.listInventory()

      const result = await createMockOrderFromApprovedPayment({
        cartItems: cart.items,
        orders: services.orders,
        payment,
        products,
      })

      expect(result).toEqual({ kind: 'not-approved', order: null })
      expect((await services.commerce.getCartByUser(payment.usuarioId))?.items).toEqual(
        cart.items,
      )
      expect(await services.catalog.listInventory()).toEqual(inventoryBefore)
      expect(
        (await services.commerce.listOrdersByUser(payment.usuarioId)).some(
          (order) => order.pagoId === payment.id,
        ),
      ).toBe(false)
    },
  )
})
