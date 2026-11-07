import { render } from '@testing-library/react'
import {
  createMemoryRouter,
  RouterProvider,
  type InitialEntry,
} from 'react-router-dom'
import { AppServicesProvider } from '../app/services'
import { DemoSessionProvider } from '../app/demoSession'
import { routeDefinitions } from '../app/router/routes'
import { AuthProvider } from '../features/auth/state'
import { CartProvider } from '../features/cart/state'
import { createMockServices } from '../mocks/repositories'
import type { MockRepositoryConfig } from '../mocks/repositories/mock-request'
import type { DemoScenarioId } from '../services'

export function renderTestApp(
  initialEntry: InitialEntry,
  scenarioId: DemoScenarioId = 'visitor',
  config: MockRepositoryConfig = { latencyMs: 0 },
) {
  const services = createMockServices(config)
  const router = createMemoryRouter(routeDefinitions, {
    initialEntries: [initialEntry],
  })
  render(
    <AppServicesProvider services={services}>
      <DemoSessionProvider initialScenarioId={scenarioId}>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </DemoSessionProvider>
    </AppServicesProvider>,
  )
  return { router, services }
}
