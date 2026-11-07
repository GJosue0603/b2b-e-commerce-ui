import { createMockServices } from '../mocks/repositories'
import { CartProvider } from '../features/cart/state'
import { AuthProvider } from '../features/auth/state'
import { DemoSessionProvider } from './demoSession'
import { AppRouter } from './router/AppRouter'
import { AppServicesProvider } from './services'

const demoServices = createMockServices()

export function App() {
  return (
    <AppServicesProvider services={demoServices}>
      <DemoSessionProvider>
        <AuthProvider>
          <CartProvider>
            <AppRouter />
          </CartProvider>
        </AuthProvider>
      </DemoSessionProvider>
    </AppServicesProvider>
  )
}
