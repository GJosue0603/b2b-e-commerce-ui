import { apiClient, ApiResponseError } from '../../http-client'
import type { ApiClient, ApiRequestOptions } from '../../http-client'
import type {
  ApiEmailVerificationRequest,
  ApiLoginRequest,
  ApiRegistrationRequest,
  ApiResendCodeRequest,
} from './contracts'

export interface ApiVerifiedUser {
  readonly id: string
  readonly nombre: string
  readonly apellido1: string
  readonly apellido2: string
  readonly correo: string
  readonly telefono: string
  readonly rol: string
  readonly activo: boolean
  readonly fechaCreacion: string
}

export interface AuthApi {
  login(
    request: ApiLoginRequest,
    options?: ApiRequestOptions,
  ): Promise<string>
  register(
    request: ApiRegistrationRequest,
    options?: ApiRequestOptions,
  ): Promise<string>
  resendCode(
    email: ApiResendCodeRequest,
    options?: ApiRequestOptions,
  ): Promise<string>
  verifyEmail(
    request: ApiEmailVerificationRequest,
    options?: ApiRequestOptions,
  ): Promise<ApiVerifiedUser>
}

const anonymousRequestOptions = (
  options?: ApiRequestOptions,
): ApiRequestOptions => ({
  ...options,
  skipAuthorization: true,
})

async function requireStringResponse(
  response: unknown,
  action: string,
): Promise<string> {
  if (typeof response !== 'string' || !response.trim()) {
    throw new ApiResponseError(
      `La API devolvió una respuesta inválida al ${action}.`,
    )
  }
  return response
}

export function createAuthApi(client: ApiClient = apiClient): AuthApi {
  return {
    async login(request, options) {
      const response = await client.post<unknown, ApiLoginRequest>(
        'autenticacion/login',
        request,
        anonymousRequestOptions(options),
      )
      return requireStringResponse(response, 'iniciar sesión')
    },

    async register(request, options) {
      const response = await client.post<unknown, ApiRegistrationRequest>(
        'autenticacion/registrar',
        request,
        anonymousRequestOptions(options),
      )
      return requireStringResponse(response, 'registrar')
    },

    async resendCode(email, options) {
      const response = await client.post<unknown, ApiResendCodeRequest>(
        'autenticacion/reenviar-codigo',
        email,
        anonymousRequestOptions(options),
      )
      return requireStringResponse(response, 'reenviar el código')
    },

    async verifyEmail(request, options) {
      const response = await client.post<
        ApiVerifiedUser,
        ApiEmailVerificationRequest
      >(
        'autenticacion/verificar-correo',
        request,
        anonymousRequestOptions(options),
      )
      if (!response || typeof response !== 'object') {
        throw new ApiResponseError(
          'La API devolvió una respuesta inválida al verificar el correo.',
        )
      }
      return response
    },
  }
}

export const authApi = createAuthApi()
