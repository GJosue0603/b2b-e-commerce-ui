import type { EntityId, EstadoPago, MontoColones, Pago } from '../../domain'
import type { RepositoryRequestOptions } from '../interfaces/common'

export type MockPaymentOutcome = Exclude<EstadoPago, 'pendiente'>

export interface StartPaymentInput {
  readonly attemptKey: string
  readonly amount: MontoColones
  readonly userId: EntityId
}

export interface PaymentGatewayResult {
  readonly payment: Pago
  readonly simulated: true
}

export interface PaymentGateway {
  getById(
    paymentId: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<Pago | null>
  resolvePayment(
    paymentId: EntityId,
    outcome: MockPaymentOutcome,
    options?: RepositoryRequestOptions,
  ): Promise<PaymentGatewayResult>
  startPayment(
    input: StartPaymentInput,
    options?: RepositoryRequestOptions,
  ): Promise<PaymentGatewayResult>
}

export const mockPaymentOutcomes = [
  { id: 'aprobado', label: 'Aprobado' },
  { id: 'rechazado', label: 'Rechazado' },
  { id: 'cancelado', label: 'Cancelado' },
] as const satisfies readonly {
  readonly id: MockPaymentOutcome
  readonly label: string
}[]
