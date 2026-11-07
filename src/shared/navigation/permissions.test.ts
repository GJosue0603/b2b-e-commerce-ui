import { describe, expect, it } from 'vitest'
import { canAccessRole, routePermissions } from './permissions'

describe('permisos de navegación interna', () => {
  it('separa las capacidades de Vendedor y Administrador', () => {
    expect(canAccessRole('vendedor', routePermissions.seller)).toBe(true)
    expect(canAccessRole('vendedor', routePermissions.administrator)).toBe(false)
    expect(canAccessRole('administrador', routePermissions.administrator)).toBe(true)
    expect(canAccessRole('comprador', routePermissions.seller)).toBe(false)
  })
})
