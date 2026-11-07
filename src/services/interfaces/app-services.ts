import type { DemoSessionRepository } from './demo-session'
import type {
  CatalogRepository,
  CommerceRepository,
  PymeRepository,
  ReportRepository,
  UserRepository,
} from './repositories'

export interface AppServices {
  readonly catalog: CatalogRepository
  readonly commerce: CommerceRepository
  readonly demoSession: DemoSessionRepository
  readonly pyme: PymeRepository
  readonly reports: ReportRepository
  readonly users: UserRepository
}
