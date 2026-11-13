import type { DemoSessionRepository } from './demo-session'
import type { DemoAuthRepository } from './demo-auth'
import type { OrderRepository } from '../order'
import type { PaymentGateway } from '../payment'
import type {
  CatalogRepository,
  CommerceRepository,
  PymeRepository,
  ReportRepository,
  UserRepository,
} from './repositories'

export interface AppServices {
  readonly demoAuth: DemoAuthRepository
  readonly catalog: CatalogRepository
  readonly commerce: CommerceRepository
  readonly demoSession: DemoSessionRepository
  readonly orders: OrderRepository
  readonly paymentGateway: PaymentGateway
  readonly pyme: PymeRepository
  readonly reports: ReportRepository
  readonly users: UserRepository
}
