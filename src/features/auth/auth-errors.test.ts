import { describe, expect, it } from 'vitest'
import { ApiHttpError } from '../../api/http-client'
import { getAuthErrorMessage } from './auth-errors'

describe('errores HTTP de autenticación', () => {
  it.each([400, 401, 403, 409, 429, 500])(
    'presenta un mensaje de fallo para HTTP %i',
    (status) => {
      const message = getAuthErrorMessage(
        new ApiHttpError(status, 'Error', undefined),
        'login',
        'api',
      )

      expect(message).toBeTruthy()
      expect(message).not.toMatch(/undefined|null/)
    },
  )

  it('distingue errores de red y no los convierte en éxito', () => {
    const message = getAuthErrorMessage(
      new TypeError('network failure'),
      'login',
      'api',
    )

    expect(message).toMatch(/No fue posible completar/)
  })
})
