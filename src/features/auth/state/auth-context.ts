import { createContext } from 'react'
import type { Usuario } from '../../../domain'
import type { BuyerProfileInput } from '../../../services'
import type { AuthMode } from '../auth-mode'

export type AuthStatus = 'loading' | 'ready'
export type AuthActionStatus = 'idle' | 'loading'

export interface RegistrationInput {
  readonly apellido1: string
  readonly apellido2: string
  readonly correo: string
  readonly nombre: string
  readonly password: string
  readonly telefono: string
}

export type AuthUser = Pick<Usuario, 'activo' | 'correo' | 'id' | 'rol'> &
  Partial<
    Pick<
      Usuario,
      'apellidos' | 'fechaCreacion' | 'nombre' | 'telefono'
    >
  >

export interface AuthResult {
  readonly message: string
  readonly ok: boolean
  readonly user?: AuthUser
}

export interface AuthContextValue {
  readonly actionStatus: AuthActionStatus
  readonly authMode: AuthMode
  readonly register: (input: RegistrationInput) => Promise<AuthResult>
  readonly resendVerificationCode: (email: string) => Promise<AuthResult>
  readonly signIn: (email: string, password: string) => Promise<AuthResult>
  readonly signOut: () => Promise<void>
  readonly status: AuthStatus
  readonly updateProfile: (input: BuyerProfileInput) => Promise<AuthResult>
  readonly user: AuthUser | null
  readonly verifyEmail: (email: string, code: string) => Promise<AuthResult>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function hasCompleteAuthProfile(
  user: AuthUser | null,
): user is Usuario {
  return Boolean(
    user &&
      typeof user.nombre === 'string' &&
      typeof user.apellidos === 'string' &&
      typeof user.telefono === 'string' &&
      typeof user.fechaCreacion === 'string',
  )
}
