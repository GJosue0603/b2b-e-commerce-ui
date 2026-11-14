import { describe, expect, it } from 'vitest'
import type { ApiUser } from '../contracts/users'
import { ApiResponseError } from '../http-client'
import { mapApiUser } from './users'

const user: ApiUser = {
  id: '65f000000000000000000001',
  nombre: 'Ana',
  apellido1: 'García',
  apellido2: 'Solís',
  correo: 'ana@example.test',
  telefono: '88880000',
  rol: 'ADMINISTRADOR',
  activo: true,
  fechaCreacion: '2026-10-01T10:00:00Z',
  fechaActualizacion: '2026-10-02T10:00:00Z',
}

describe('mapeador de usuarios API', () => {
  it.each([
    ['COMPRADOR', 'comprador'],
    ['VENDEDOR', 'vendedor'],
    ['ADMINISTRADOR', 'administrador'],
  ] as const)('mapea el rol backend %s', (backendRole, role) => {
    expect(mapApiUser({ ...user, rol: backendRole }).rol).toBe(role)
  })

  it('conserva el ID real y une los apellidos del DTO', () => {
    expect(mapApiUser(user)).toEqual({
      id: user.id,
      nombre: 'Ana',
      apellidos: 'García Solís',
      correo: user.correo,
      telefono: user.telefono,
      rol: 'administrador',
      activo: true,
      fechaCreacion: user.fechaCreacion,
    })
  })

  it('rechaza roles que el backend no define', () => {
    expect(() => mapApiUser({ ...user, rol: 'SUPERVISOR' })).toThrow(
      ApiResponseError,
    )
  })
})
