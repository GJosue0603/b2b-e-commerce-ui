import type { Usuario } from '../../domain'
import type { ApiUser } from '../contracts/users'
import { ApiResponseError } from '../http-client'

const backendRoles: Readonly<Record<string, Usuario['rol']>> = {
  ADMINISTRADOR: 'administrador',
  COMPRADOR: 'comprador',
  VENDEDOR: 'vendedor',
}

export function mapApiRole(role: string): Usuario['rol'] | null {
  return backendRoles[role.toUpperCase()] ?? null
}

export function mapApiUser(user: ApiUser): Usuario {
  const role = mapApiRole(user.rol)
  if (!role) {
    throw new ApiResponseError(
      `La API devolvió un rol de usuario no reconocido: ${user.rol}.`,
    )
  }

  return {
    id: user.id,
    nombre: user.nombre,
    apellidos: [user.apellido1, user.apellido2].filter(Boolean).join(' '),
    correo: user.correo,
    telefono: user.telefono,
    rol: role,
    activo: user.activo,
    fechaCreacion: user.fechaCreacion,
  }
}
