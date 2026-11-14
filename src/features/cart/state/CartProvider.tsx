import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ApiHttpError } from '../../../api/http-client'
import { cartApi } from '../../../api/services/cart/cart-api'
import type { ApiCart } from '../../../api/services/cart/contracts'
import type { EntityId, ItemCarrito } from '../../../domain'
import { useAppServices } from '../../../app/services'
import type { AuthUser } from '../../auth/state'
import { useAuth } from '../../auth/state'
import {
  resolveCatalogDataMode,
  type CatalogDataMode,
} from '../../catalog/hooks/useCatalogReader'
import { getCartErrorMessage } from '../cart-errors'
import {
  resolveCartDataMode,
  type CartDataMode,
} from '../cart-mode'
import {
  CartContext,
  type CartContextValue,
  type CartMutationResult,
} from './cart-context'

interface CartSnapshot {
  readonly errorMessage?: string
  readonly items: readonly ItemCarrito[]
  readonly ownerKey: string
  readonly sessionUser?: AuthUser | null
  readonly serverCart?: ApiCart
  readonly status: 'error' | 'success'
}

const EMPTY_CART_ITEMS: readonly ItemCarrito[] = []
const EMPTY_API_CART: ApiCart = { items: [], total: 0 }

export interface CartProviderProps {
  readonly children: ReactNode
  readonly catalogMode?: CatalogDataMode
  readonly mode?: CartDataMode
}

function failure(message: string): CartMutationResult {
  return { message, ok: false }
}

function success(message: string): CartMutationResult {
  return { message, ok: true }
}

function validateQuantity(
  quantity: number,
  availableStock: number,
): CartMutationResult | null {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return failure('La cantidad mínima es 1.')
  }
  if (quantity > availableStock) {
    return failure('La cantidad supera las existencias disponibles.')
  }
  return null
}

function toDomainItems(cart: ApiCart): readonly ItemCarrito[] {
  return cart.items.map(({ productoId, cantidad }) => ({ productoId, cantidad }))
}

export function CartProvider({
  catalogMode,
  children,
  mode: configuredMode,
}: CartProviderProps) {
  const mode = configuredMode ?? resolveCartDataMode()

  return mode === 'api' ? (
    <ApiCartProvider
      catalogAvailable={
        (catalogMode ?? resolveCatalogDataMode()) === 'api'
      }
    >
      {children}
    </ApiCartProvider>
  ) : (
    <DemoCartProvider>{children}</DemoCartProvider>
  )
}

function DemoCartProvider({ children }: CartProviderProps) {
  const { commerce } = useAppServices()
  const { status: authStatus, user } = useAuth()
  const ownerKey = authStatus === 'ready' ? (user?.id ?? 'visitor') : undefined
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
          setSnapshot({
            errorMessage: 'No fue posible cargar el carrito demostrativo.',
            items: [],
            ownerKey,
            status: 'error',
          })
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
    async (
      productId: EntityId,
      quantity: number,
      availableStock: number,
    ): Promise<CartMutationResult> => {
      if (!ownerKey) return failure('Espera a que termine de cargar la sesión.')
      const existingQuantity =
        items.find((item) => item.productoId === productId)?.cantidad ?? 0
      const nextQuantity = existingQuantity + quantity
      const validation = validateQuantity(nextQuantity, availableStock)
      if (validation) return validation

      setSnapshot((previous) => {
        if (!previous || previous.ownerKey !== ownerKey) return previous
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
      return success('Producto agregado al carrito demostrativo.')
    },
    [items, ownerKey],
  )

  const updateQuantity = useCallback(
    async (
      productId: EntityId,
      quantity: number,
      availableStock: number,
    ): Promise<CartMutationResult> => {
      const validation = validateQuantity(quantity, availableStock)
      if (validation) return validation
      setSnapshot((previous) => {
        if (!previous || previous.ownerKey !== ownerKey) return previous
        return {
          ...previous,
          items: previous.items.map((item) =>
            item.productoId === productId
              ? { ...item, cantidad: quantity }
              : item,
          ),
        }
      })
      return success('Cantidad actualizada en el carrito demostrativo.')
    },
    [ownerKey],
  )

  const removeItem = useCallback(
    async (productId: EntityId): Promise<CartMutationResult> => {
      setSnapshot((previous) => {
        if (!previous || previous.ownerKey !== ownerKey) return previous
        return {
          ...previous,
          items: previous.items.filter((item) => item.productoId !== productId),
        }
      })
      return success('Producto eliminado del carrito demostrativo.')
    },
    [ownerKey],
  )

  const clear = useCallback(async (): Promise<CartMutationResult> => {
    setSnapshot((previous) => {
      if (!previous || previous.ownerKey !== ownerKey) return previous
      return { ...previous, items: [] }
    })
    return success('Carrito demostrativo vaciado.')
  }, [ownerKey])

  const value = useMemo<CartContextValue>(
    () => ({
      addItem,
      clear,
      errorMessage: current?.errorMessage,
      itemCount: items.reduce((total, item) => total + item.cantidad, 0),
      items,
      mode: 'demo',
      mutationPending: false,
      removeItem,
      serverCart: null,
      status,
      updateQuantity,
    }),
    [
      addItem,
      clear,
      current?.errorMessage,
      items,
      removeItem,
      status,
      updateQuantity,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function ApiCartProvider({
  catalogAvailable,
  children,
}: {
  readonly catalogAvailable: boolean
  readonly children: ReactNode
}) {
  const { authMode, signOut, status: authStatus, user } = useAuth()
  const authApiAvailable = authMode === 'api'
  const ownerKey =
    authStatus === 'ready' && authApiAvailable ? user?.id : undefined
  const [snapshot, setSnapshot] = useState<CartSnapshot | null>(null)
  const [mutationPending, setMutationPending] = useState(false)
  const mutationPendingRef = useRef(false)

  const current =
    ownerKey &&
    snapshot?.ownerKey === ownerKey &&
    snapshot.sessionUser === user
      ? snapshot
      : undefined

  useEffect(() => {
    if (!ownerKey || !authApiAvailable || !catalogAvailable) return
    const controller = new AbortController()

    void cartApi
      .getCart({ signal: controller.signal })
      .then((serverCart) => {
        if (!controller.signal.aborted) {
          setSnapshot({
            items: toDomainItems(serverCart),
            ownerKey,
            serverCart,
            sessionUser: user,
            status: 'success',
          })
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        if (reason instanceof ApiHttpError && reason.status === 401) {
          void signOut()
        }
        setSnapshot({
          errorMessage: getCartErrorMessage(reason),
          items: [],
          ownerKey,
          sessionUser: user,
          status: 'error',
        })
      })

    return () => controller.abort()
  }, [authApiAvailable, catalogAvailable, ownerKey, signOut, user])

  const status =
    authStatus === 'loading'
      ? 'loading'
      : !authApiAvailable
        ? 'error'
      : !ownerKey
        ? 'unauthenticated'
        : !catalogAvailable
          ? 'error'
          : (current?.status ?? 'loading')
  const errorMessage =
    !authApiAvailable
      ? 'El carrito API requiere VITE_AUTH_MODE=api para usar una sesión JWT real.'
      : !catalogAvailable
      ? 'El carrito API requiere VITE_CATALOG_DATA_MODE=api para evitar mezclar productos demo con IDs del backend.'
      : current?.errorMessage
  const items = current?.items ?? EMPTY_CART_ITEMS
  const serverCart = current?.serverCart ?? null

  const executeMutation = useCallback(
    async (
      action: () => Promise<ApiCart | undefined>,
      successMessage: string,
    ): Promise<CartMutationResult> => {
      if (!authApiAvailable) {
        return failure('El carrito API requiere la autenticación configurada en modo API.')
      }
      if (!ownerKey) return failure('Inicia sesión para usar el carrito de la API.')
      if (!catalogAvailable) {
        return failure(
          'El carrito API requiere el catálogo configurado en modo API.',
        )
      }
      if (!current || current.status !== 'success' || !current.serverCart) {
        return failure('Espera a que el carrito termine de cargar.')
      }
      if (mutationPendingRef.current) {
        return failure('Ya hay una operación del carrito en curso.')
      }

      mutationPendingRef.current = true
      setMutationPending(true)
      try {
        const response = await action()
        const nextServerCart = response ?? EMPTY_API_CART
        setSnapshot({
          items: toDomainItems(nextServerCart),
          ownerKey,
          sessionUser: user,
          serverCart: nextServerCart,
          status: 'success',
        })
        return success(successMessage)
      } catch (reason) {
        if (reason instanceof ApiHttpError && reason.status === 401) {
          await signOut()
        }
        return failure(getCartErrorMessage(reason))
      } finally {
        mutationPendingRef.current = false
        setMutationPending(false)
      }
    },
    [authApiAvailable, catalogAvailable, current, ownerKey, signOut, user],
  )

  const addItem = useCallback(
    (
      productId: EntityId,
      quantity: number,
      availableStock: number,
    ): Promise<CartMutationResult> => {
      if (!Number.isInteger(quantity) || quantity < 1) {
        return Promise.resolve(failure('La cantidad mínima es 1.'))
      }
      // The backend checks stock authoritatively because catalog stock may be stale.
      void availableStock
      const existingQuantity =
        serverCart?.items.find((item) => item.productoId === productId)
          ?.cantidad ?? 0
      // PUT replaces quantity, so adding units must send the desired final total.
      const desiredQuantity = existingQuantity + quantity
      return executeMutation(
        () => cartApi.setItemQuantity(productId, desiredQuantity),
        'Producto agregado al carrito.',
      )
    },
    [executeMutation, serverCart],
  )

  const updateQuantity = useCallback(
    (
      productId: EntityId,
      quantity: number,
      availableStock: number,
    ): Promise<CartMutationResult> => {
      if (!Number.isInteger(quantity) || quantity < 1) {
        return Promise.resolve(failure('La cantidad mínima es 1.'))
      }
      // The backend checks stock authoritatively because catalog stock may be stale.
      void availableStock
      return executeMutation(
        () => cartApi.setItemQuantity(productId, quantity),
        'Cantidad actualizada.',
      )
    },
    [executeMutation],
  )

  const removeItem = useCallback(
    (productId: EntityId): Promise<CartMutationResult> =>
      executeMutation(
        () => cartApi.removeItem(productId),
        'Producto eliminado del carrito.',
      ),
    [executeMutation],
  )

  const clear = useCallback(
    (): Promise<CartMutationResult> =>
      executeMutation(
        async () => {
          await cartApi.clearCart()
          return undefined
        },
        'Carrito vaciado.',
      ),
    [executeMutation],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      addItem,
      clear,
      errorMessage,
      itemCount: items.reduce((total, item) => total + item.cantidad, 0),
      items,
      mode: 'api',
      mutationPending,
      removeItem,
      serverCart,
      status,
      updateQuantity,
    }),
    [
      addItem,
      clear,
      errorMessage,
      items,
      mutationPending,
      removeItem,
      serverCart,
      status,
      updateQuantity,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
