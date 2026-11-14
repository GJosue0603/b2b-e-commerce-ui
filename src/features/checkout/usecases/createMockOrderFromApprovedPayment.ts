import {
  calculateCartTotals,
  calculateUnitPrice,
  type AcreditacionPyme,
  type ItemCarrito,
  type ItemPedido,
  type Pago,
  type Pedido,
  type Producto,
} from '../../../domain'
import {
  RepositoryError,
  type OrderRepository,
} from '../../../services'

export interface CreateMockOrderInput {
  readonly accreditation?: AcreditacionPyme | null
  readonly cartItems: readonly ItemCarrito[]
  readonly orders: OrderRepository
  readonly payment: Pago
  readonly products: readonly Producto[]
}

export type CreateMockOrderResult =
  | { readonly kind: 'created' | 'existing'; readonly order: Pedido }
  | { readonly kind: 'not-approved'; readonly order: null }

export async function createMockOrderFromApprovedPayment({
  accreditation,
  cartItems,
  orders,
  payment,
  products,
}: CreateMockOrderInput): Promise<CreateMockOrderResult> {
  const existing = await orders.findByPaymentId(payment.id)
  if (existing) return { kind: 'existing', order: existing }
  if (payment.estado !== 'aprobado') {
    return { kind: 'not-approved', order: null }
  }

  const productById = new Map(products.map((product) => [product.id, product]))
  const lines = cartItems.map((item) => {
    const product = productById.get(item.productoId)
    if (!product) {
      throw new RepositoryError(
        'El carrito contiene un producto que ya no está disponible.',
        'not_found',
      )
    }
    return { item, product }
  })
  if (lines.length === 0) {
    throw new RepositoryError(
      'No se puede crear un pedido sin artículos.',
      'conflict',
    )
  }

  const totals = calculateCartTotals(
    lines.map(({ item, product }) => ({
      product,
      quantity: item.cantidad,
    })),
    accreditation,
  )
  if (payment.monto !== totals.total) {
    throw new RepositoryError(
      'El monto de la transacción no coincide con el carrito.',
      'conflict',
    )
  }

  const snapshots: ItemPedido[] = lines.map(({ item, product }) => {
    const unitPrice = calculateUnitPrice(product, accreditation)
    return {
      productoId: product.id,
      nombreProducto: product.nombre,
      precioUnitario: unitPrice,
      cantidad: item.cantidad,
      subtotal: unitPrice * item.cantidad,
    }
  })
  const order = await orders.commitApprovedOrder({
    discount: totals.savings,
    items: snapshots,
    orderId: `demo-pedido-${payment.id}`,
    paymentId: payment.id,
    regularSubtotal: totals.regularSubtotal,
    total: totals.total,
    userId: payment.usuarioId,
  })
  return { kind: 'created', order }
}
