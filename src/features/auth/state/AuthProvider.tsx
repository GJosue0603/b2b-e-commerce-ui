import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Usuario } from '../../../domain'
import type { BuyerProfileInput } from '../../../services'
import { useDemoSession } from '../../../app/demoSession'
import { useAppServices } from '../../../app/services'
import { clearApiAccessToken, setApiAccessToken } from '../../../api/access-token-store'
import { authApi } from '../../../api/services/auth/auth-api'
import { getAuthErrorMessage } from '../auth-errors'
import { resolveAuthMode } from '../auth-mode'
import { InvalidApiTokenError, parseApiAuthToken } from '../api-session'
import {
  AuthContext,
  type AuthActionStatus,
  type AuthContextValue,
  type AuthResult,
  type RegistrationInput,
} from './auth-context'

export interface AuthProviderProps {
  readonly children: ReactNode
}

function failure(message: string): AuthResult {
  return { message, ok: false }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authMode = resolveAuthMode()

  return authMode === 'api' ? (
    <ApiAuthProvider>{children}</ApiAuthProvider>
  ) : (
    <DemoAuthProvider>{children}</DemoAuthProvider>
  )
}

function DemoAuthProvider({ children }: AuthProviderProps) {
  const { demoAuth, users } = useAppServices()
  const { selectScenario, state: demoState } = useDemoSession()
  const [identityOverride, setIdentityOverride] = useState<{
    readonly scenarioId: string | undefined
    readonly user: Usuario | null
  }>()
  const [actionStatus, setActionStatus] = useState<AuthActionStatus>('idle')
  const scenarioId =
    demoState.status === 'success'
      ? demoState.data.session.scenario.id
      : undefined

  const scenarioUser =
    demoState.status === 'success' ? demoState.data.session.user : null
  const hasCurrentOverride =
    identityOverride !== undefined && identityOverride.scenarioId === scenarioId
  const user =
    hasCurrentOverride && identityOverride
      ? identityOverride.user
      : scenarioUser
  const status =
    !hasCurrentOverride &&
    (demoState.status === 'idle' || demoState.status === 'loading')
      ? 'loading'
      : 'ready'

  const runAction = useCallback(
    async (action: () => Promise<Usuario>): Promise<AuthResult> => {
      setActionStatus('loading')
      try {
        const nextUser = await action()
        setIdentityOverride({ scenarioId, user: nextUser })
        return {
          ok: true,
          message: 'Operación simulada completada.',
          user: nextUser,
        }
      } catch (reason) {
        return failure(
          reason instanceof Error
            ? reason.message
            : 'No fue posible completar la operación simulada.',
        )
      } finally {
        setActionStatus('idle')
      }
    },
    [scenarioId],
  )

  const signIn = useCallback(
    (email: string, password: string) =>
      runAction(async () => {
        const authentication = await demoAuth.authenticate({ email, password })
        if (!authentication?.user.activo) {
          throw new Error('Las credenciales demostrativas no son válidas.')
        }
        const session = await selectScenario(authentication.scenarioId)
        if (!session?.user) {
          throw new Error('No fue posible iniciar el escenario demostrativo.')
        }
        return session.user
      }),
    [demoAuth, runAction, selectScenario],
  )

  const register = useCallback(
    (input: RegistrationInput) =>
      runAction(() =>
        users.createBuyer({
          apellidos: [input.apellido1, input.apellido2]
            .filter(Boolean)
            .join(' '),
          correo: input.correo,
          nombre: input.nombre,
          telefono: input.telefono,
        }),
      ),
    [runAction, users],
  )

  const updateProfile = useCallback(
    (input: BuyerProfileInput) => {
      if (!user) return Promise.resolve(failure('No hay una sesión autenticada.'))
      return runAction(() => users.updateProfile(user.id, input))
    },
    [runAction, user, users],
  )

  const signOut = useCallback(async () => {
    setIdentityOverride({ scenarioId, user: null })
    await selectScenario('visitor')
  }, [scenarioId, selectScenario])

  const unsupportedEmailAction = useCallback(
    async () =>
      failure('La verificación por correo solo está disponible en modo API.'),
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      actionStatus,
      authMode: 'demo',
      register,
      resendVerificationCode: unsupportedEmailAction,
      signIn,
      signOut,
      status,
      updateProfile,
      user,
      verifyEmail: unsupportedEmailAction,
    }),
    [
      actionStatus,
      register,
      signIn,
      signOut,
      status,
      unsupportedEmailAction,
      updateProfile,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function ApiAuthProvider({ children }: AuthProviderProps) {
  const [apiSession, setApiSession] = useState<ReturnType<
    typeof parseApiAuthToken
  > | null>(null)
  const [actionStatus, setActionStatus] = useState<AuthActionStatus>('idle')

  useEffect(() => {
    if (!apiSession) return

    let timeout: number
    const expireSession = () => {
      const remaining = apiSession.expiresAt - Date.now()
      if (remaining > 0) {
        timeout = window.setTimeout(
          expireSession,
          Math.min(remaining, 2_147_483_647),
        )
        return
      }
      clearApiAccessToken()
      setApiSession(null)
    }

    timeout = window.setTimeout(
      expireSession,
      Math.min(
        Math.max(apiSession.expiresAt - Date.now(), 0),
        2_147_483_647,
      ),
    )
    return () => {
      window.clearTimeout(timeout)
    }
  }, [apiSession])

  useEffect(() => () => clearApiAccessToken(), [])

  const runApiAction = useCallback(
    async (
      operation: 'login' | 'register' | 'verify' | 'resend',
      action: () => Promise<AuthResult>,
    ): Promise<AuthResult> => {
      setActionStatus('loading')
      try {
        return await action()
      } catch (reason) {
        return failure(
          reason instanceof InvalidApiTokenError
            ? reason.message
            : getAuthErrorMessage(reason, operation, 'api'),
        )
      } finally {
        setActionStatus('idle')
      }
    },
    [],
  )

  const signIn = useCallback(
    (email: string, password: string) =>
      runApiAction('login', async () => {
        const token = await authApi.login({
          contrasena: password,
          correo: email.trim(),
        })
        const session = parseApiAuthToken(token)
        setApiAccessToken(token, session.expiresAt)
        setApiSession(session)
        return { message: 'Sesión iniciada.', ok: true, user: session.user }
      }),
    [runApiAction],
  )

  const register = useCallback(
    (input: RegistrationInput) =>
      runApiAction('register', async () => {
        const message = await authApi.register({
          apellido1: input.apellido1.trim(),
          apellido2: input.apellido2.trim(),
          contrasena: input.password,
          correo: input.correo.trim(),
          nombre: input.nombre.trim(),
          telefono: input.telefono.trim(),
        })
        return { message, ok: true }
      }),
    [runApiAction],
  )

  const verifyEmail = useCallback(
    (email: string, code: string) =>
      runApiAction('verify', async () => {
        await authApi.verifyEmail({ codigo: code.trim(), correo: email.trim() })
        return {
          message: 'El correo se verificó correctamente. Ahora puedes iniciar sesión.',
          ok: true,
        }
      }),
    [runApiAction],
  )

  const resendVerificationCode = useCallback(
    (email: string) =>
      runApiAction('resend', async () => ({
        message: await authApi.resendCode(email.trim()),
        ok: true,
      })),
    [runApiAction],
  )

  const updateProfile = useCallback(
    async () =>
      failure(
        'La API todavía no ofrece un endpoint para consultar o actualizar el perfil.',
      ),
    [],
  )

  const signOut = useCallback(async () => {
    clearApiAccessToken()
    setApiSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      actionStatus,
      authMode: 'api',
      register,
      resendVerificationCode,
      signIn,
      signOut,
      status: 'ready',
      updateProfile,
      user: apiSession?.user ?? null,
      verifyEmail,
    }),
    [
      actionStatus,
      apiSession,
      register,
      resendVerificationCode,
      signIn,
      signOut,
      updateProfile,
      verifyEmail,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
