import { createContext } from 'react'
import type { Usuario } from '../../../domain'
import type { BuyerProfileInput } from '../../../services'

export type AuthStatus = 'loading' | 'ready'
export type AuthActionStatus = 'idle' | 'loading'

export interface AuthResult {
  readonly message: string
  readonly ok: boolean
  readonly user?: Usuario
}

export interface AuthContextValue {
  readonly actionStatus: AuthActionStatus
  readonly register: (input: BuyerProfileInput) => Promise<AuthResult>
  readonly signIn: (email: string, password: string) => Promise<AuthResult>
  readonly signOut: () => Promise<void>
  readonly status: AuthStatus
  readonly updateProfile: (input: BuyerProfileInput) => Promise<AuthResult>
  readonly user: Usuario | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
