import { describe, expect, it } from 'vitest'
import { createMockServices } from '../repositories'

describe('mockPaymentGateway', () => {
  it.each(['aprobado', 'rechazado', 'cancelado'] as const)(
    'transiciona de pendiente a %s sin datos bancarios',
    async (outcome) => {
      const services = createMockServices({ latencyMs: 0 })
      const input = {
        amount: 61_800,
        attemptKey: `intento-${outcome}`,
        userId: 'demo-usuario-comprador-regular',
      }

      const pending = await services.paymentGateway.startPayment(input)
      expect(pending.simulated).toBe(true)
      expect(pending.payment.estado).toBe('pendiente')
      expect(pending.payment.proveedor).toBe('Pasarela local simulada')

      const resolved = await services.paymentGateway.resolvePayment(
        pending.payment.id,
        outcome,
      )
      expect(resolved.payment.estado).toBe(outcome)
      expect(JSON.stringify(resolved)).not.toMatch(/tarjeta|cvv|contraseña/i)
    },
  )

  it('reutiliza la transacción para una misma clave de intento', async () => {
    const services = createMockServices({ latencyMs: 0 })
    const input = {
      amount: 56_400,
      attemptKey: 'intento-idempotente',
      userId: 'demo-usuario-comprador-pyme-activo',
    }

    const first = await services.paymentGateway.startPayment(input)
    const repeated = await services.paymentGateway.startPayment(input)

    expect(repeated.payment.id).toBe(first.payment.id)
  })
})
