import { createMockServices } from '../mocks/repositories'
import { CartProvider } from '../features/cart/state'
import { DemoSessionProvider } from './demoSession'
import { AppRouter } from './router/AppRouter'
import { AppServicesProvider } from './services'

const demoServices = createMockServices()

export function App() {
  return (
    <AppServicesProvider services={demoServices}>
      <DemoSessionProvider>
        <CartProvider>
          <AppRouter />
        </CartProvider>
      </DemoSessionProvider>
    </AppServicesProvider>
  )
}
