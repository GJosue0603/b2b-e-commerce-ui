import { describe, expect, it, vi } from 'vitest'
import type { ApiUser } from '../contracts/users'
import { ApiClient } from '../http-client'
import { createAdminUsersService } from './admin-users'

const user: ApiUser = {
  id: '65f000000000000000000001',
  nombre: 'Ana',
  apellido1: 'García',
  apellido2: 'Solís',
  correo: 'ana@example.test',
  telefono: '88880000',
  rol: 'COMPRADOR',
  activo: true,
  fechaCreacion: '2026-10-01T10:00:00Z',
  fechaActualizacion: '2026-10-02T10:00:00Z',
}

describe('servicio administrativo de usuarios', () => {
  it('consulta una página real y mapea el DTO con autorización', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          cantidadTotalDeItems: 26,
          items: [user],
          numeroDePagina: 2,
          cantidadPorPagina: 25,
          totalDePaginas: 2,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const service = createAdminUsersService(
      new ApiClient({
        baseUrl: '/v1',
        fetcher,
        getAccessToken: () => 'admin-token',
      }),
    )

    const page = await service.listUsersPage({
      numeroDePagina: 2,
      cantidadPorPagina: 25,
    })

    expect(page.items[0]?.id).toBe(user.id)
    expect(page.items[0]?.rol).toBe('comprador')
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      '/v1/usuarios?numeroDePagina=2&cantidadPorPagina=25',
    )
    expect(new Headers(fetcher.mock.calls[0]?.[1]?.headers).get('Authorization'))
      .toBe('Bearer admin-token')
  })

  it('consulta el detalle con el ID recibido, sin sustituirlo por datos demo', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const service = createAdminUsersService(new ApiClient({ fetcher }))

    const result = await service.getUserById(user.id)

    expect(result.id).toBe(user.id)
    expect(fetcher.mock.calls[0]?.[0]).toBe(`/v1/usuarios/${user.id}`)
  })
})
