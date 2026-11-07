import { useEffect, useState } from 'react'
import type { EntityId } from '../../domain'
import { useAppServices } from '../../app/services'

type CartRequestState =
  | {
      readonly status: 'success'
      readonly itemCount: number
      readonly userId: EntityId
    }
  | {
      readonly status: 'error'
      readonly userId: EntityId
    }
  | null

export interface CartSummary {
  readonly itemCount: number
  readonly status: 'loading' | 'success' | 'error'
}

export function useCartSummary(
  userId: EntityId | null | undefined,
): CartSummary {
  const { commerce } = useAppServices()
  const [requestState, setRequestState] = useState<CartRequestState>(null)

  useEffect(() => {
    if (!userId) return

    const controller = new AbortController()
    void commerce
      .getCartByUser(userId, { signal: controller.signal })
      .then((cart) => {
        const itemCount =
          cart?.items.reduce((total, item) => total + item.cantidad, 0) ?? 0
        setRequestState({ status: 'success', itemCount, userId })
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRequestState({ status: 'error', userId })
        }
      })

    return () => controller.abort()
  }, [commerce, userId])

  if (userId === undefined) return { itemCount: 0, status: 'loading' }
  if (userId === null) return { itemCount: 0, status: 'success' }
  if (!requestState || requestState.userId !== userId) {
    return { itemCount: 0, status: 'loading' }
  }
  if (requestState.status === 'error') {
    return { itemCount: 0, status: 'error' }
  }
  return { itemCount: requestState.itemCount, status: 'success' }
}
