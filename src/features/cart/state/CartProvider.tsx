import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { EntityId, ItemCarrito } from '../../../domain'
import { useDemoSession } from '../../../app/demoSession'
import { useAppServices } from '../../../app/services'
import {
  CartContext,
  type CartContextValue,
  type CartMutationResult,
} from './cart-context'

interface CartSnapshot {
  readonly items: readonly ItemCarrito[]
  readonly ownerKey: string
  readonly status: 'error' | 'success'
}

const EMPTY_CART_ITEMS: readonly ItemCarrito[] = []

export interface CartProviderProps {
  readonly children: ReactNode
}

function validateQuantity(
  quantity: number,
  availableStock: number,
): CartMutationResult | null {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, message: 'La cantidad mínima es 1.' }
  }
  if (quantity > availableStock) {
    return {
      ok: false,
      message: 'La cantidad supera las existencias disponibles.',
    }
  }
  return null
}

export function CartProvider({ children }: CartProviderProps) {
  const { commerce } = useAppServices()
  const { state: sessionState } = useDemoSession()
  const ownerKey =
    sessionState.status === 'success'
      ? (sessionState.data.session.user?.id ?? 'visitor')
      : undefined
  const [snapshot, setSnapshot] = useState<CartSnapshot | null>(null)

  useEffect(() => {
    if (!ownerKey) return
    const controller = new AbortController()
    const request =
      ownerKey === 'visitor'
        ? Promise.resolve(null)
        : commerce.getCartByUser(ownerKey, { signal: controller.signal })

    void request
      .then((cart) => {
        if (!controller.signal.aborted) {
          setSnapshot({
            items: cart?.items ?? [],
            ownerKey,
            status: 'success',
          })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSnapshot({ items: [], ownerKey, status: 'error' })
        }
      })

    return () => controller.abort()
  }, [commerce, ownerKey])

  const current =
    ownerKey && snapshot?.ownerKey === ownerKey ? snapshot : undefined
  const items = current?.items ?? EMPTY_CART_ITEMS
  const status = ownerKey
    ? (current?.status ?? 'loading')
    : 'loading'

  const addItem = useCallback(
    (
      productId: EntityId,
      quantity: number,
      availableStock: number,
    ): CartMutationResult => {
      const existingQuantity =
        items.find((item) => item.productoId === productId)?.cantidad ?? 0
      const nextQuantity = existingQuantity + quantity
      const validation = validateQuantity(nextQuantity, availableStock)
      if (validation) return validation

      setSnapshot((previous) => {
        if (!ownerKey || previous?.ownerKey !== ownerKey) return previous
        const exists = previous.items.some(
          (item) => item.productoId === productId,
        )
        const nextItems = exists
          ? previous.items.map((item) =>
              item.productoId === productId
                ? { ...item, cantidad: nextQuantity }
                : item,
            )
          : [...previous.items, { productoId: productId, cantidad: quantity }]
        return { ...previous, items: nextItems, status: 'success' }
      })
      return { ok: true, message: 'Producto agregado al carrito.' }
    },
    [items, ownerKey],
  )

  const updateQuantity = useCallback(
    (
      productId: EntityId,
      quantity: number,
      availableStock: number,
    ): CartMutationResult => {
      const validation = validateQuantity(quantity, availableStock)
      if (validation) return validation
      setSnapshot((previous) => {
        if (!previous || previous.ownerKey !== ownerKey) return previous
        return {
          ...previous,
          items: previous.items.map((item) =>
            item.productoId === productId ? { ...item, cantidad: quantity } : item,
          ),
        }
      })
      return { ok: true, message: 'Cantidad actualizada.' }
    },
    [ownerKey],
  )

  const removeItem = useCallback(
    (productId: EntityId) => {
      setSnapshot((previous) => {
        if (!previous || previous.ownerKey !== ownerKey) return previous
        return {
          ...previous,
          items: previous.items.filter((item) => item.productoId !== productId),
        }
      })
    },
    [ownerKey],
  )

  const clear = useCallback(() => {
    setSnapshot((previous) => {
      if (!previous || previous.ownerKey !== ownerKey) return previous
      return { ...previous, items: [] }
    })
  }, [ownerKey])

  const value = useMemo<CartContextValue>(
    () => ({
      addItem,
      clear,
      itemCount: items.reduce((total, item) => total + item.cantidad, 0),
      items,
      removeItem,
      status,
      updateQuantity,
    }),
    [addItem, clear, items, removeItem, status, updateQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
