import { describe, expect, it } from 'vitest'
import { ApiHttpError } from '../../api/http-client'
import { getCartErrorMessage } from './cart-errors'

describe('errores HTTP del carrito', () => {
  it('solicita volver a iniciar sesión ante 401', () => {
    expect(getCartErrorMessage(new ApiHttpError(401, 'Unauthorized', undefined)))
      .toMatch(/sesión expiró/i)
  })

  it('explica el permiso requerido ante 403', () => {
    expect(getCartErrorMessage(new ApiHttpError(403, 'Forbidden', undefined)))
      .toMatch(/permiso/i)
  })

  it('conserva el detalle de producto inexistente en 404', () => {
    expect(
      getCartErrorMessage(
        new ApiHttpError(404, 'Not Found', 'Producto desactivado.'),
      ),
    ).toBe('Producto desactivado.')
  })

  it('conserva el mensaje de stock insuficiente en 409', () => {
    expect(
      getCartErrorMessage(
        new ApiHttpError(409, 'Conflict', 'Solo hay 3 unidades disponibles.'),
      ),
    ).toBe('Solo hay 3 unidades disponibles.')
  })
})
