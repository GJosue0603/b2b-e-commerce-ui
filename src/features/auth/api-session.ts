import type { AuthUser } from './state/auth-context'
import { mapApiRole } from '../../api/mappers/users'

export interface ApiAuthSession {
  readonly expiresAt: number
  readonly user: AuthUser
}

export class InvalidApiTokenError extends Error {
  constructor(message = 'La API devolvió un token inválido.') {
    super(message)
    this.name = 'InvalidApiTokenError'
  }
}

export function mapBackendRole(role: string): AuthUser['rol'] | null {
  return mapApiRole(role)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function decodePayload(segment: string): unknown {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const bytes = Uint8Array.from(atob(padded), (character) =>
    character.charCodeAt(0),
  )
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown
}

export function parseApiAuthToken(
  token: string,
  now: number = Date.now(),
): ApiAuthSession {
  const [header, payload, signature, ...rest] = token.split('.')
  if (!header || !payload || !signature || rest.length > 0) {
    throw new InvalidApiTokenError()
  }

  let claims: unknown
  try {
    claims = decodePayload(payload)
  } catch {
    throw new InvalidApiTokenError()
  }

  if (!isRecord(claims)) throw new InvalidApiTokenError()
  const id = claims.sub
  const email = claims.email
  const role = claims.rol
  const expiresAtClaim = claims.exp
  const active =
    claims.activo === true ||
    (typeof claims.activo === 'string' &&
      claims.activo.toLowerCase() === 'true')

  if (
    typeof id !== 'string' ||
    !id ||
    typeof email !== 'string' ||
    !email ||
    typeof role !== 'string' ||
    typeof expiresAtClaim !== 'number' ||
    !Number.isFinite(expiresAtClaim) ||
    !active
  ) {
    throw new InvalidApiTokenError()
  }

  const mappedRole = mapBackendRole(role)
  const expiresAt = expiresAtClaim * 1000
  if (!mappedRole || expiresAt <= now) {
    throw new InvalidApiTokenError(
      !mappedRole
        ? 'El token contiene un rol no reconocido.'
        : 'La sesión de la API ya expiró.',
    )
  }

  // Decoding supplies UI state only; the backend remains responsible for token validation.
  return {
    expiresAt,
    user: {
      activo: true,
      correo: email,
      id,
      rol: mappedRole,
    },
  }
}
