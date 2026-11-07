import type { RolUsuario, Usuario } from '../../domain'
import type { DemoScenarioId } from './demo-session'
import type { RepositoryRequestOptions } from './common'

export interface DemoAccessProfile {
  readonly email: string
  readonly label: string
  readonly password: string
  readonly role: RolUsuario
  readonly scenarioId: DemoScenarioId
}

export interface DemoCredentials {
  readonly email: string
  readonly password: string
}

export interface DemoAuthentication {
  readonly scenarioId: DemoScenarioId
  readonly user: Usuario
}

export interface DemoAuthRepository {
  authenticate(
    credentials: DemoCredentials,
    options?: RepositoryRequestOptions,
  ): Promise<DemoAuthentication | null>
  listAccessProfiles(
    options?: RepositoryRequestOptions,
  ): Promise<readonly DemoAccessProfile[]>
}
