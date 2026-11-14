import { ApiHttpError, ApiNetworkError } from '../../api/http-client'

function getServerMessage(body: unknown): string | undefined {
  if (typeof body === 'string' && body.trim()) return body
  if (typeof body !== 'object' || body === null) return undefined

  for (const key of ['detail', 'message', 'title']) {
    const value = Reflect.get(body, key)
    if (typeof value === 'string' && value.trim()) return value
  }
  return undefined
}

export function getAdminApiErrorMessage(
  reason: unknown,
  entity: 'categoría' | 'usuario',
): string {
  if (reason instanceof ApiHttpError) {
    const detail = getServerMessage(reason.body)
    switch (reason.status) {
      case 400:
        return detail ?? 'La solicitud contiene datos inválidos.'
      case 401:
        return 'La sesión expiró o no es válida. Inicia sesión nuevamente.'
      case 403:
        return 'Tu cuenta no tiene permisos de administrador para esta operación.'
      case 404:
        return detail ?? `No se encontró el ${entity} solicitado.`
      case 409:
        return detail ?? `La operación entra en conflicto con el estado del ${entity}.`
      case 429:
        return 'Se realizaron demasiadas solicitudes. Inténtalo nuevamente más tarde.'
      default:
        return reason.status >= 500
          ? 'El servidor no pudo completar la operación.'
          : detail ?? `La API respondió con el estado ${reason.status}.`
    }
  }

  if (reason instanceof ApiNetworkError) {
    return 'No fue posible conectar con la API. Comprueba la conexión e inténtalo nuevamente.'
  }

  return reason instanceof Error
    ? reason.message
    : `No fue posible cargar el ${entity}.`
}
