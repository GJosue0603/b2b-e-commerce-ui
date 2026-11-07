import {
  RepositoryError,
  type RepositoryRequestOptions,
} from '../../services'

export type MockOperation =
  | 'catalog.createCategory'
  | 'catalog.createProduct'
  | 'catalog.getProductById'
  | 'catalog.listCategories'
  | 'catalog.listInventory'
  | 'catalog.listManagedCategories'
  | 'catalog.listManagedProducts'
  | 'catalog.listProducts'
  | 'catalog.setCategoryActive'
  | 'catalog.setProductActive'
  | 'catalog.updateCategory'
  | 'catalog.updateProduct'
  | 'commerce.getCartByUser'
  | 'commerce.listOrdersByUser'
  | 'commerce.listPaymentsByUser'
  | 'orders.commitApprovedOrder'
  | 'orders.findByPaymentId'
  | 'paymentGateway.getById'
  | 'paymentGateway.resolvePayment'
  | 'paymentGateway.startPayment'
  | 'demoAuth.authenticate'
  | 'demoAuth.listAccessProfiles'
  | 'demoSession.getByScenario'
  | 'demoSession.listScenarios'
  | 'pyme.getAccreditationByUser'
  | 'pyme.getAccreditationsByUser'
  | 'pyme.getRequestByUser'
  | 'pyme.listRequestsByUser'
  | 'pyme.listRequests'
  | 'pyme.submitRequest'
  | 'reports.list'
  | 'users.getById'
  | 'users.getByEmail'
  | 'users.createBuyer'
  | 'users.list'
  | 'users.updateProfile'

export interface MockRepositoryConfig {
  readonly failOperations?: readonly MockOperation[]
  readonly latencyMs?: number
}

export function createMockRequest(config: MockRepositoryConfig) {
  const latencyMs = Math.max(0, config.latencyMs ?? 120)
  const failedOperations = new Set(config.failOperations)

  return function mockRequest<T>(
    operation: MockOperation,
    value: T,
    options: RepositoryRequestOptions = {},
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const rejectAsAborted = () => {
        reject(new RepositoryError('La solicitud simulada fue cancelada.', 'aborted'))
      }

      if (options.signal?.aborted) {
        rejectAsAborted()
        return
      }

      const timer = globalThis.setTimeout(() => {
        options.signal?.removeEventListener('abort', onAbort)

        if (failedOperations.has(operation)) {
          reject(
            new RepositoryError(
              `Fallo simulado determinista en ${operation}.`,
              'mock_failure',
            ),
          )
          return
        }

        resolve(structuredClone(value))
      }, latencyMs)

      const onAbort = () => {
        globalThis.clearTimeout(timer)
        rejectAsAborted()
      }

      options.signal?.addEventListener('abort', onAbort, { once: true })
    })
  }
}
