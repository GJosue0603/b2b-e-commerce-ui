import { describe, expect, it } from 'vitest'
import { ApiHttpError, ApiNetworkError } from '../../api/http-client'
import { getAdminApiErrorMessage } from './admin-api-errors'

describe('errores de administración API', () => {
  it.each([
    [400, 'La solicitud contiene datos inválidos.'],
    [401, 'La sesión expiró o no es válida. Inicia sesión nuevamente.'],
    [403, 'Tu cuenta no tiene permisos de administrador para esta operación.'],
    [404, 'No se encontró el usuario solicitado.'],
    [409, 'La operación entra en conflicto con el estado del usuario.'],
    [429, 'Se realizaron demasiadas solicitudes. Inténtalo nuevamente más tarde.'],
    [500, 'El servidor no pudo completar la operación.'],
  ])('presenta un mensaje explícito para HTTP %i', (status, message) => {
    expect(
      getAdminApiErrorMessage(
        new ApiHttpError(status, '', undefined),
        'usuario',
      ),
    ).toBe(message)
  })

  it('conserva el detalle de validación enviado por el backend', () => {
    expect(
      getAdminApiErrorMessage(
        new ApiHttpError(400, '', 'El nombre de la categoría es requerido.'),
        'categoría',
      ),
    ).toBe('El nombre de la categoría es requerido.')
  })

  it('distingue los fallos de red de las respuestas HTTP', () => {
    expect(
      getAdminApiErrorMessage(new ApiNetworkError('offline'), 'categoría'),
    ).toContain('No fue posible conectar con la API')
  })
})
