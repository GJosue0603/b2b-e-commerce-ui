import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  AsyncState,
  DemoScenarioId,
  DemoSession,
} from '../../services'
import { useAppServices } from '../services'
import {
  DemoSessionContext,
  type DemoSessionContextValue,
  type DemoSessionData,
} from './demo-session-context'

export interface DemoSessionProviderProps {
  readonly children: ReactNode
  readonly initialScenarioId?: DemoScenarioId
}

export function DemoSessionProvider({
  children,
  initialScenarioId = 'visitor',
}: DemoSessionProviderProps) {
  const { demoSession } = useAppServices()
  const [state, setState] = useState<AsyncState<DemoSessionData>>({
    status: 'idle',
  })
  const selectedScenario = useRef<DemoScenarioId>(initialScenarioId)
  const activeRequest = useRef<AbortController | null>(null)

  const loadScenario = useCallback(
    async (scenarioId: DemoScenarioId): Promise<DemoSession | null> => {
      activeRequest.current?.abort()
      const controller = new AbortController()
      activeRequest.current = controller
      selectedScenario.current = scenarioId
      setState({ status: 'loading' })

      try {
        const [scenarios, session] = await Promise.all([
          demoSession.listScenarios({ signal: controller.signal }),
          demoSession.getByScenario(scenarioId, {
            signal: controller.signal,
          }),
        ])

        if (activeRequest.current !== controller) return null
        setState({ status: 'success', data: { scenarios, session } })
        return session
      } catch (reason) {
        if (controller.signal.aborted) return null
        const error =
          reason instanceof Error
            ? reason
            : new Error('No fue posible cargar la sesión demostrativa.')
        setState({ status: 'error', error })
        return null
      }
    },
    [demoSession],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadScenario(initialScenarioId)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      activeRequest.current?.abort()
    }
  }, [initialScenarioId, loadScenario])

  const value = useMemo<DemoSessionContextValue>(
    () => ({
      retry: () => loadScenario(selectedScenario.current),
      selectScenario: loadScenario,
      state,
    }),
    [loadScenario, state],
  )

  return (
    <DemoSessionContext.Provider value={value}>
      {children}
    </DemoSessionContext.Provider>
  )
}
