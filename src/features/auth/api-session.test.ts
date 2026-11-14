import { describe, expect, it } from 'vitest'
import { mapBackendRole, parseApiAuthToken } from './api-session'

function createToken(claims: Record<string, unknown>): string {
  const encode = (value: string) =>
    btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${encode('{"alg":"none"}')}.${encode(JSON.stringify(claims))}.signature`
}

describe('estado de sesión API', () => {
  it.each([
    ['COMPRADOR', 'comprador'],
    ['VENDEDOR', 'vendedor'],
    ['ADMINISTRADOR', 'administrador'],
  ] as const)('mapea rol %s a %s', (backendRole, frontendRole) => {
    expect(mapBackendRole(backendRole)).toBe(frontendRole)
  })

  it('extrae identidad y expiración de claims válidos para estado de UI', () => {
    const session = parseApiAuthToken(
      createToken({
        activo: 'True',
        email: 'buyer@example.test',
        exp: 120,
        rol: 'COMPRADOR',
        sub: 'user-123',
      }),
      100_000,
    )

    expect(session).toEqual({
      expiresAt: 120_000,
      user: {
        activo: true,
        correo: 'buyer@example.test',
        id: 'user-123',
        rol: 'comprador',
      },
    })
  })

  it.each([
    {
      activo: true,
      email: 'buyer@example.test',
      exp: 100,
      rol: 'COMPRADOR',
      sub: 'user-123',
    },
    {
      activo: true,
      email: 'buyer@example.test',
      exp: 120,
      rol: 'SUPERUSER',
      sub: 'user-123',
    },
  ])('rechaza una sesión expirada o con rol desconocido', (claims) => {
    expect(() => parseApiAuthToken(createToken(claims), 100_000)).toThrow(
      /token|expiró/i,
    )
  })
})
