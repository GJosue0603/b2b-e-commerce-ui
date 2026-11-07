import type { Pago } from '../../domain'
import {
  RepositoryError,
  type PaymentGateway,
  type StartPaymentInput,
} from '../../services'
import type { createMockRequest } from '../repositories/mock-request'

type MockRequest = ReturnType<typeof createMockRequest>

export interface MockPaymentStore {
  readonly attempts: Map<string, string>
  readonly payments: Pago[]
}

export function createMockPaymentGateway(
  request: MockRequest,
  store: MockPaymentStore,
): PaymentGateway {
  let sequence = 0

  return {
    getById: (paymentId, options) =>
      request(
        'paymentGateway.getById',
        store.payments.find((payment) => payment.id === paymentId) ?? null,
        options,
      ),
    startPayment: async (input, options) => {
      await request('paymentGateway.startPayment', null, options)
      const previousId = store.attempts.get(input.attemptKey)
      const previous = store.payments.find((payment) => payment.id === previousId)
      if (previous) return { payment: structuredClone(previous), simulated: true }

      sequence += 1
      const payment = createPendingPayment(input, sequence)
      store.payments.push(payment)
      store.attempts.set(input.attemptKey, payment.id)
      return { payment: structuredClone(payment), simulated: true }
    },
    resolvePayment: async (paymentId, outcome, options) => {
      await request('paymentGateway.resolvePayment', null, options)
      const index = store.payments.findIndex((payment) => payment.id === paymentId)
      if (index < 0) {
        throw new RepositoryError(
          'La transacción demostrativa no existe.',
          'not_found',
        )
      }
      const current = store.payments[index]!
      if (current.estado !== 'pendiente' && current.estado !== outcome) {
        throw new RepositoryError(
          'La transacción demostrativa ya tiene un resultado diferente.',
          'conflict',
        )
      }
      const resolved: Pago = { ...current, estado: outcome }
      store.payments[index] = resolved
      return { payment: structuredClone(resolved), simulated: true }
    },
  }
}

function createPendingPayment(
  input: StartPaymentInput,
  sequence: number,
): Pago {
  const suffix = String(sequence).padStart(3, '0')
  return {
    id: `demo-pago-${suffix}`,
    usuarioId: input.userId,
    proveedor: 'Pasarela local simulada',
    referenciaExterna: `DEMO-LOCAL-${suffix}`,
    monto: input.amount,
    estado: 'pendiente',
    fechaPago: '2026-11-07T18:30:00.000Z',
  }
}
