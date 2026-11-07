import { createMockServices } from '../mocks/repositories'
import { DemoSessionProvider } from './demoSession'
import { AppRouter } from './router/AppRouter'
import { AppServicesProvider } from './services'

const demoServices = createMockServices()

export function App() {
  return (
    <AppServicesProvider services={demoServices}>
      <DemoSessionProvider>
        <AppRouter />
      </DemoSessionProvider>
    </AppServicesProvider>
  )
}
