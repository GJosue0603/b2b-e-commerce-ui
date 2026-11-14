import {
  ApiAbortError,
  ApiHttpError,
  ApiNetworkError,
  ApiResponseError,
} from '../../api/http-client'
import type { AuthMode } from './auth-mode'

export type AuthOperation = 'login' | 'register' | 'verify' | 'resend'

const statusMessages: Record<AuthOperation, Partial<Record<number, string>>> = {
  login: {
    400: 'Revisa el correo y la contraseña ingresados.',
    401: 'El correo o la contraseña no son correctos.',
    403: 'La cuenta todavía no está habilitada para iniciar sesión.',
    409: 'No fue posible iniciar sesión debido al estado de la cuenta.',
    429: 'Se realizaron demasiados intentos. Espera antes de intentarlo de nuevo.',
    500: 'El servicio de autenticación no está disponible temporalmente.',
  },
  register: {
    400: 'Revisa los datos del formulario.',
    401: 'La API no autorizó el registro.',
    403: 'La API no permite registrar esta cuenta.',
    409: 'Ya existe una cuenta con ese correo.',
    429: 'Se realizaron demasiados registros. Espera antes de intentarlo de nuevo.',
    500: 'El servicio de registro no está disponible temporalmente.',
  },
  verify: {
    400: 'El correo o el código de verificación no son válidos.',
    401: 'La verificación no fue autorizada.',
    403: 'No se pudo verificar esta cuenta.',
    409: 'La cuenta ya fue verificada o el código ya no es válido.',
    429: 'Se realizaron demasiados intentos. Espera antes de intentarlo de nuevo.',
    500: 'El servicio de verificación no está disponible temporalmente.',
  },
  resend: {
    400: 'No fue posible reenviar el código para ese correo.',
    401: 'El reenvío del código no fue autorizado.',
    403: 'No se puede reenviar un código para esta cuenta.',
    409: 'La cuenta no admite un nuevo código en este momento.',
    429: 'Se solicitaron demasiados códigos. Espera antes de intentarlo de nuevo.',
    500: 'El servicio de verificación no está disponible temporalmente.',
  },
}

function bodyMessage(body: unknown): string | undefined {
  if (typeof body === 'string' && body.trim()) return body
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = body.message
    if (typeof message === 'string' && message.trim()) return message
  }
  return undefined
}

export function getAuthErrorMessage(
  reason: unknown,
  operation: AuthOperation,
  mode: AuthMode,
): string {
  if (reason instanceof ApiHttpError) {
    return (
      statusMessages[operation][reason.status] ??
      bodyMessage(reason.body) ??
      `La API rechazó la solicitud (HTTP ${reason.status}).`
    )
  }
  if (reason instanceof ApiNetworkError) {
    return 'No se pudo conectar con la API. Comprueba que el backend esté disponible.'
  }
  if (reason instanceof ApiAbortError) {
    return 'La solicitud fue cancelada.'
  }
  if (reason instanceof ApiResponseError) {
    return reason.message
  }

  return mode === 'api'
    ? 'No fue posible completar la solicitud de autenticación.'
    : reason instanceof Error
      ? reason.message
      : 'No fue posible completar la operación.'
}
