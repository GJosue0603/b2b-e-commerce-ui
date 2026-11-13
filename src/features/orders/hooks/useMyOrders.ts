import { useEffect, useState } from 'react'
import type { Pago, Pedido } from '../../../domain'
import type { AsyncState } from '../../../services'
import { useAppServices } from '../../../app/services'

export interface ConfirmedOrder {
  readonly order: Pedido
  readonly payment: Pago
}

interface OrdersSnapshot {
  readonly state: AsyncState<readonly ConfirmedOrder[]>
  readonly userId: string
}

export function useMyOrders(userId: string | undefined) {
  const { commerce } = useAppServices()
  const [snapshot, setSnapshot] = useState<OrdersSnapshot | null>(null)

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()

    void Promise.all([
      commerce.listOrdersByUser(userId, { signal: controller.signal }),
      commerce.listPaymentsByUser(userId, { signal: controller.signal }),
    ])
      .then(([orders, payments]) => {
        if (controller.signal.aborted) return
        const approvedPayments = new Map(
          payments
            .filter((payment) => payment.estado === 'aprobado')
            .map((payment) => [payment.id, payment]),
        )
        const confirmed = orders.flatMap((order) => {
          const payment = approvedPayments.get(order.pagoId)
          return payment ? [{ order, payment }] : []
        })
        setSnapshot({
          state: { status: 'success', data: confirmed },
          userId,
        })
      })
      .catch((reason) => {
        if (controller.signal.aborted) return
        setSnapshot({
          state: {
            status: 'error',
            error:
              reason instanceof Error
                ? reason
                : new Error('No fue posible consultar los pedidos.'),
          },
          userId,
        })
      })

    return () => controller.abort()
  }, [commerce, userId])

  if (!userId) return { status: 'idle' } as const
  return snapshot?.userId === userId
    ? snapshot.state
    : ({ status: 'loading' } as const)
}
