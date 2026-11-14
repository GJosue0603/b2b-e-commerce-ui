import { createContext } from 'react'
import type { ApiCart } from '../../../api/services/cart/contracts'
import type { EntityId, ItemCarrito } from '../../../domain'
import type { CartDataMode } from '../cart-mode'

export type CartStatus =
  | 'loading'
  | 'success'
  | 'error'
  | 'unauthenticated'

export interface CartMutationResult {
  readonly message: string
  readonly ok: boolean
}

export interface CartContextValue {
  readonly addItem: (
    productId: EntityId,
    quantity: number,
    availableStock: number,
  ) => Promise<CartMutationResult>
  readonly clear: () => Promise<CartMutationResult>
  readonly errorMessage?: string
  readonly itemCount: number
  readonly items: readonly ItemCarrito[]
  readonly mode: CartDataMode
  readonly mutationPending: boolean
  readonly removeItem: (productId: EntityId) => Promise<CartMutationResult>
  readonly serverCart: ApiCart | null
  readonly status: CartStatus
  readonly updateQuantity: (
    productId: EntityId,
    quantity: number,
    availableStock: number,
  ) => Promise<CartMutationResult>
}

export const CartContext = createContext<CartContextValue | null>(null)
