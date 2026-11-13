import { createContext } from 'react'
import type {
  AsyncState,
  DemoScenario,
  DemoScenarioId,
  DemoSession,
} from '../../services'

export interface DemoSessionData {
  readonly scenarios: readonly DemoScenario[]
  readonly session: DemoSession
}

export interface DemoSessionContextValue {
  readonly retry: () => Promise<DemoSession | null>
  readonly selectScenario: (
    scenarioId: DemoScenarioId,
  ) => Promise<DemoSession | null>
  readonly state: AsyncState<DemoSessionData>
}

export const DemoSessionContext =
  createContext<DemoSessionContextValue | null>(null)
