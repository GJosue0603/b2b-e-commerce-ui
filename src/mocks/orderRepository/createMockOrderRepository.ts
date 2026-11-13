import type {
  Carrito,
  InventarioProducto,
  Pedido,
  Producto,
} from '../../domain'
import {
  RepositoryError,
  type OrderRepository,
} from '../../services'
import type { createMockRequest } from '../repositories/mock-request'

type MockRequest = ReturnType<typeof createMockRequest>

export interface MockCommerceStore {
  carts: Carrito[]
  inventory: InventarioProducto[]
  orders: Pedido[]
  products: Producto[]
}

export function createMockOrderRepository(
  request: MockRequest,
  store: MockCommerceStore,
): OrderRepository {
  return {
    findByPaymentId: (paymentId, options) =>
      request(
        'orders.findByPaymentId',
        store.orders.find((order) => order.pagoId === paymentId) ?? null,
        options,
      ),
    commitApprovedOrder: async (input, options) => {
      await request('orders.commitApprovedOrder', null, options)
      const existing = store.orders.find(
        (order) => order.pagoId === input.paymentId,
      )
      if (existing) return structuredClone(existing)

      for (const item of input.items) {
        const inventory = store.inventory.find(
          (entry) => entry.productoId === item.productoId,
        )
        if (!inventory || inventory.existencias < item.cantidad) {
          throw new RepositoryError(
            `No hay existencias suficientes para ${item.nombreProducto}.`,
            'conflict',
          )
        }
      }

      const orderedQuantities = new Map(
        input.items.map((item) => [item.productoId, item.cantidad]),
      )
      store.inventory = store.inventory.map((entry) => {
        const quantity = orderedQuantities.get(entry.productoId) ?? 0
        if (quantity === 0) return entry
        const existencias = entry.existencias - quantity
        return {
          ...entry,
          existencias,
          estado:
            existencias === 0
              ? 'agotado'
              : existencias <= entry.umbralBajo
                ? 'bajo'
                : 'disponible',
          fechaActualizacion: '2026-11-07T18:31:00.000Z',
        }
      })
      store.products = store.products.map((product) => {
        const quantity = orderedQuantities.get(product.id) ?? 0
        return quantity === 0
          ? product
          : { ...product, existencias: product.existencias - quantity }
      })
      store.carts = store.carts.map((cart) =>
        cart.usuarioId === input.userId
          ? {
              ...cart,
              items: [],
              fechaModificacion: '2026-11-07T18:31:00.000Z',
            }
          : cart,
      )

      const order: Pedido = {
        id: input.orderId,
        usuarioId: input.userId,
        pagoId: input.paymentId,
        items: input.items,
        subtotal: input.regularSubtotal,
        descuento: input.discount,
        total: input.total,
        fechaPedido: '2026-11-07T18:31:00.000Z',
      }
      store.orders.push(order)
      return structuredClone(order)
    },
  }
}
