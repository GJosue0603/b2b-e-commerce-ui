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

  it('autentica credenciales demo y rechaza una contraseña incorrecta', async () => {
    const services = createMockServices({ latencyMs: 0 })

    await expect(
      services.demoAuth.authenticate({
        email: 'admin@nexotech.demo.test',
        password: 'Admin123!',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        scenarioId: 'administrator',
        user: expect.objectContaining({ rol: 'administrador' }),
      }),
    )
    await expect(
      services.demoAuth.authenticate({
        email: 'admin@nexotech.demo.test',
        password: 'incorrecta',
      }),
    ).resolves.toBeNull()
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

  it('registra una solicitud pendiente y evita solicitudes incompatibles', async () => {
    const services = createMockServices({ latencyMs: 0 })
    const input = {
      actividadEconomica: 'Comercio',
      documentos: ['local-demo://personeria.pdf'],
      identificacionNegocio: '3-101-999999',
      nombreComercial: 'Nexo Café',
      usuarioId: 'demo-usuario-comprador-regular',
    }

    await expect(services.pyme.submitRequest(input)).resolves.toMatchObject({
      estado: 'pendiente',
      usuarioId: input.usuarioId,
    })
    await expect(services.pyme.submitRequest(input)).rejects.toMatchObject({
      code: 'conflict',
    })
    await expect(
      services.pyme.submitRequest({
        ...input,
        usuarioId: 'demo-usuario-comprador-pyme-activa',
      }),
    ).rejects.toMatchObject({ code: 'conflict' })
  })

  it.each([
    ['demo-usuario-comprador-pyme-rechazada', 'Nueva solicitud'],
    ['demo-usuario-comprador-pyme-vencida', 'Renovación'],
  ])(
    'preserva historial al registrar %s después de rechazo o vencimiento',
    async (userId, nombreComercial) => {
      const services = createMockServices({ latencyMs: 0 })
      const before = await services.pyme.listRequestsByUser(userId)

      await services.pyme.submitRequest({
        actividadEconomica: 'Servicios tecnológicos',
        documentos: ['local-demo://renovacion.pdf'],
        identificacionNegocio: 'DEMO-RENOVACION',
        nombreComercial,
        usuarioId: userId,
      })
      const after = await services.pyme.listRequestsByUser(userId)

      expect(after).toHaveLength(before.length + 1)
      expect(after[0]).toMatchObject({ estado: 'pendiente', nombreComercial })
      expect(after.map((request) => request.id)).toEqual(
        expect.arrayContaining(before.map((request) => request.id)),
      )
    },
  )
})
