import {
  ApiAbortError,
  ApiHttpError,
  ApiNetworkError,
  ApiResponseError,
} from '../../api/http-client'

function responseMessage(body: unknown): string | undefined {
  if (typeof body === 'string' && body.trim()) return body
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = body.message
    if (typeof message === 'string' && message.trim()) return message
  }
  return undefined
}

export function getCartErrorMessage(reason: unknown): string {
  if (reason instanceof ApiHttpError) {
    const detail = responseMessage(reason.body)
    switch (reason.status) {
      case 401:
        return 'Tu sesión expiró. Inicia sesión de nuevo para consultar el carrito.'
      case 403:
        return 'Tu cuenta no tiene permiso para acceder a este carrito.'
      case 404:
        return detail ?? 'El producto solicitado ya no existe o no está disponible.'
      case 409:
        return detail ?? 'No hay existencias suficientes para esa cantidad.'
      case 400:
        return detail ?? 'La solicitud del carrito no es válida.'
      default:
        return detail ?? `La API rechazó la solicitud (HTTP ${reason.status}).`
    }
  }
  if (reason instanceof ApiNetworkError) {
    return 'No se pudo conectar con la API. Comprueba que el backend esté disponible.'
  }
  if (reason instanceof ApiAbortError) return 'La solicitud fue cancelada.'
  if (reason instanceof ApiResponseError) return reason.message
  return 'No fue posible completar la operación del carrito.'
}
