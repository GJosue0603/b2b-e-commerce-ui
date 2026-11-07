import { createContext } from 'react'
import type { EntityId, ItemCarrito } from '../../../domain'

export type CartStatus = 'loading' | 'success' | 'error'

export interface CartMutationResult {
  readonly message: string
  readonly ok: boolean
}

export interface CartContextValue {
  readonly addItem: (
    productId: EntityId,
    quantity: number,
    availableStock: number,
  ) => CartMutationResult
  readonly clear: () => void
  readonly itemCount: number
  readonly items: readonly ItemCarrito[]
  readonly removeItem: (productId: EntityId) => void
  readonly status: CartStatus
  readonly updateQuantity: (
    productId: EntityId,
    quantity: number,
    availableStock: number,
  ) => CartMutationResult
}

export const CartContext = createContext<CartContextValue | null>(null)
