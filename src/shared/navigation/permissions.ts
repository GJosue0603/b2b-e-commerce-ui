import type { RolUsuario } from '../../domain'

export const routePermissions = {
  seller: ['vendedor'],
  administrator: ['administrador'],
  buyer: ['comprador'],
} as const satisfies Record<string, readonly RolUsuario[]>

export function canAccessRole(
  role: RolUsuario,
  allowedRoles: readonly RolUsuario[],
) {
  return allowedRoles.includes(role)
}
