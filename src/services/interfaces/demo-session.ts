import type { AcreditacionPyme, Usuario } from '../../domain'
import type { RepositoryRequestOptions } from './common'

export type DemoScenarioId =
  | 'visitor'
  | 'buyer-regular'
  | 'buyer-pyme-active'
  | 'buyer-pyme-expired'
  | 'buyer-pyme-pending'
  | 'buyer-pyme-rejected'
  | 'buyer-pyme-revoked'
  | 'seller'
  | 'administrator'

export interface DemoScenario {
  readonly id: DemoScenarioId
  readonly label: string
  readonly description: string
  readonly landingPath: string
}

export interface DemoSession {
  readonly scenario: DemoScenario
  readonly user: Usuario | null
  readonly accreditation: AcreditacionPyme | null
  readonly pymePricingEnabled: boolean
  readonly simulated: true
}

export interface DemoSessionRepository {
  getByScenario(
    scenarioId: DemoScenarioId,
    options?: RepositoryRequestOptions,
  ): Promise<DemoSession>
  listScenarios(
    options?: RepositoryRequestOptions,
  ): Promise<readonly DemoScenario[]>
}
