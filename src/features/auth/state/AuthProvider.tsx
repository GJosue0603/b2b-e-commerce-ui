import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Usuario } from '../../../domain'
import type { BuyerProfileInput } from '../../../services'
import { useDemoSession } from '../../../app/demoSession'
import { useAppServices } from '../../../app/services'
import {
  AuthContext,
  type AuthActionStatus,
  type AuthContextValue,
  type AuthResult,
} from './auth-context'

export interface AuthProviderProps {
  readonly children: ReactNode
}

function errorResult(reason: unknown): AuthResult {
  return {
    message:
      reason instanceof Error
        ? reason.message
        : 'No fue posible completar la operación simulada.',
    ok: false,
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { users } = useAppServices()
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
        return errorResult(reason)
      } finally {
        setActionStatus('idle')
      }
    },
    [scenarioId],
  )

  const signIn = useCallback(
    (email: string) =>
      runAction(async () => {
        const found = await users.getByEmail(email)
        if (!found?.activo) {
          throw new Error('Las credenciales demostrativas no son válidas.')
        }
        return found
      }),
    [runAction, users],
  )

  const register = useCallback(
    (input: BuyerProfileInput) => runAction(() => users.createBuyer(input)),
    [runAction, users],
  )

  const updateProfile = useCallback(
    (input: BuyerProfileInput) => {
      if (!user) {
        return Promise.resolve({
          ok: false,
          message: 'No hay una sesión autenticada.',
        })
      }
      return runAction(() => users.updateProfile(user.id, input))
    },
    [runAction, user, users],
  )

  const signOut = useCallback(async () => {
    setIdentityOverride({ scenarioId, user: null })
    await selectScenario('visitor')
  }, [scenarioId, selectScenario])

  const value = useMemo<AuthContextValue>(
    () => ({
      actionStatus,
      register,
      signIn,
      signOut,
      status,
      updateProfile,
      user,
    }),
    [actionStatus, register, signIn, signOut, status, updateProfile, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
