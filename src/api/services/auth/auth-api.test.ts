import { describe, expect, it } from 'vitest'
import { ApiClient } from '../../http-client'
import { createAuthApi } from './auth-api'

function createTestApi(responseBody: unknown, status = 200) {
  const calls: { readonly input: RequestInfo | URL; readonly init?: RequestInit }[] =
    []
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ input, init })
    return new Response(JSON.stringify(responseBody), {
      headers: { 'Content-Type': 'application/json' },
      status,
    })
  }
  const api = createAuthApi(new ApiClient({ baseUrl: '/v1', fetcher }))
  return { api, calls }
}

describe('servicio HTTP de autenticación', () => {
  it('envía el contrato completo de registro y devuelve la respuesta string', async () => {
    const { api, calls } = createTestApi('Revisa tu correo.', 201)
    const request = {
      apellido1: 'Vargas',
      apellido2: 'Mora',
      contrasena: 'Clave1234',
      correo: 'lucia@example.test',
      nombre: 'Lucía',
      telefono: '+506 8888-7777',
    }

    await expect(api.register(request)).resolves.toBe('Revisa tu correo.')
    expect(calls[0]?.input).toBe('/v1/autenticacion/registrar')
    expect(calls[0]?.init?.body).toBe(JSON.stringify(request))
  })

  it('lee el token de login como string JSON, no como objeto', async () => {
    const token = 'header.eyJzdWIiOiJ1c2VyIn0.signature'
    const { api, calls } = createTestApi(token)

    await expect(
      api.login({ contrasena: 'Clave1234', correo: 'lucia@example.test' }),
    ).resolves.toBe(token)
    expect(calls[0]?.input).toBe('/v1/autenticacion/login')
  })

  it('serializa el correo de reenvío como string JSON', async () => {
    const { api, calls } = createTestApi('Código reenviado.')

    await expect(api.resendCode('lucia@example.test')).resolves.toBe(
      'Código reenviado.',
    )
    expect(calls[0]?.input).toBe('/v1/autenticacion/reenviar-codigo')
    expect(calls[0]?.init?.body).toBe(JSON.stringify('lucia@example.test'))
  })

  it('envía el correo y código al endpoint de verificación', async () => {
    const user = {
      activo: true,
      apellido1: 'Vargas',
      apellido2: 'Mora',
      correo: 'lucia@example.test',
      fechaCreacion: '2026-01-01T00:00:00Z',
      id: 'user-1',
      nombre: 'Lucía',
      rol: 'COMPRADOR',
      telefono: '+506 8888-7777',
    }
    const { api, calls } = createTestApi(user)

    await expect(
      api.verifyEmail({ codigo: '123456', correo: user.correo }),
    ).resolves.toEqual(user)
    expect(calls[0]?.input).toBe('/v1/autenticacion/verificar-correo')
    expect(calls[0]?.init?.body).toBe(
      JSON.stringify({ codigo: '123456', correo: user.correo }),
    )
  })
})
