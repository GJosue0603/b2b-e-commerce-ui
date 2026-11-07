import { describe, expect, it } from 'vitest'
import { RepositoryError } from '../../services'
import { createMockServices } from './createMockServices'

describe('repositorios mock', () => {
  it('resuelve escenarios deterministas y aplica la vigencia de PrecioPyme', async () => {
    const services = createMockServices({ latencyMs: 0 })

    const active = await services.demoSession.getByScenario('buyer-pyme-active')
    const expired = await services.demoSession.getByScenario(
      'buyer-pyme-expired',
    )

    expect(active.user?.rol).toBe('comprador')
    expect(active.accreditation?.estado).toBe('activa')
    expect(active.pymePricingEnabled).toBe(true)
    expect(expired.accreditation?.estado).toBe('vencida')
    expect(expired.pymePricingEnabled).toBe(false)
  })

  it('devuelve copias para evitar que la UI altere los fixtures', async () => {
    const services = createMockServices({ latencyMs: 0 })
    const firstRead = await services.catalog.listProducts()
    const secondRead = await services.catalog.listProducts()

    expect(firstRead).not.toBe(secondRead)
    expect(firstRead[0]).not.toBe(secondRead[0])
    expect(firstRead).toEqual(secondRead)
  })

  it('permite simular errores de forma explícita y repetible', async () => {
    const services = createMockServices({
      failOperations: ['catalog.listProducts'],
      latencyMs: 0,
    })

    await expect(services.catalog.listProducts()).rejects.toEqual(
      expect.objectContaining<Partial<RepositoryError>>({
        code: 'mock_failure',
      }),
    )
  })
})
