export interface ApiCartItem {
  readonly productoId: string
  readonly nombreProducto: string
  readonly precioUnitario: number
  readonly cantidad: number
  readonly subtotal: number
  readonly disponible: boolean
}

export interface ApiCart {
  readonly items: readonly ApiCartItem[]
  readonly total: number
}

export interface ApiCartItemRequest {
  readonly cantidad: number
}
