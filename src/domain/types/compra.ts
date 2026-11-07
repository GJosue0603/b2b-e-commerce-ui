import type { EntityId, IsoDateTime, MontoColones } from './common'

export interface ItemCarrito {
  readonly productoId: EntityId
  readonly cantidad: number
}

export interface Carrito {
  readonly id: EntityId
  readonly usuarioId: EntityId
  readonly items: readonly ItemCarrito[]
  readonly fechaCreacion: IsoDateTime
  readonly fechaModificacion: IsoDateTime
}

export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado'

export interface Pago {
  readonly id: EntityId
  readonly usuarioId: EntityId
  readonly proveedor: string
  readonly referenciaExterna: string
  readonly monto: MontoColones
  readonly estado: EstadoPago
  readonly fechaPago: IsoDateTime
}

export interface ItemPedido {
  readonly productoId: EntityId
  readonly nombreProducto: string
  readonly precioUnitario: MontoColones
  readonly cantidad: number
  readonly subtotal: MontoColones
}

export interface Pedido {
  readonly id: EntityId
  readonly usuarioId: EntityId
  readonly pagoId: EntityId
  readonly items: readonly ItemPedido[]
  readonly subtotal: MontoColones
  readonly descuento: MontoColones
  readonly total: MontoColones
  readonly fechaPedido: IsoDateTime
}
