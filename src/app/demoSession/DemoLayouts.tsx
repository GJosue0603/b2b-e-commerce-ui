import type { DashboardRole } from '../../shared/navigation'
import { DashboardLayout, StoreLayout } from '../../shared/layouts'
import { useCart } from '../../features/cart/state'
import { CartPage } from '../../features/cart/pages/CartPage'
import { CheckoutPage } from '../../features/checkout/pages/CheckoutPage'
import { PaymentResultPage } from '../../features/checkout/pages/PaymentResultPage'
import { CatalogPage } from '../../features/catalog/pages/CatalogPage'
import { ProductDetailPage } from '../../features/catalog/pages/ProductDetailPage'
import { HomePage } from '../../features/store/pages/HomePage'
import { useAuth } from '../../features/auth/state'
import { resolveAuthMode } from '../../features/auth/auth-mode'
import { resolveCartDataMode } from '../../features/cart/cart-mode'
import { resolveCatalogDataMode } from '../../features/catalog/hooks/useCatalogReader'
import { useDemoSession } from './useDemoSession'

function areIntegrationModesAligned() {
  const modes = [
    resolveAuthMode(),
    resolveCatalogDataMode(),
    resolveCartDataMode(),
  ] as const

  return modes.every((mode) => mode === modes[0])
}

function getDemoAccreditation(
  state: ReturnType<typeof useDemoSession>['state'],
) {
  if (!areIntegrationModesAligned() || resolveAuthMode() !== 'demo') {
    return null
  }

  return state.status === 'success' ? state.data.session.accreditation : null
}

export function DemoStoreLayout() {
  const { signOut, user } = useAuth()
  const { state } = useDemoSession()
  const cart = useCart()
  const authenticated = Boolean(user)
  const showAccreditationNavigation =
    areIntegrationModesAligned() &&
    resolveAuthMode() === 'demo' &&
    state.status === 'success' &&
    state.data.session.scenario.id !== 'buyer-regular'

  return (
    <StoreLayout
      authenticated={authenticated}
      role={user?.rol}
      cartItemCount={cart.itemCount}
      cartStatus={cart.status}
      showAccreditationNavigation={showAccreditationNavigation}
      onSignOut={signOut}
    />
  )
}

export function DemoHomePage() {
  const { state } = useDemoSession()
  return <HomePage accreditation={getDemoAccreditation(state)} />
}

export function DemoCatalogPage() {
  const { state } = useDemoSession()
  const { addItem } = useCart()
  const canUseConfiguredCart = areIntegrationModesAligned()

  return (
    <CatalogPage
      accreditation={getDemoAccreditation(state)}
      onAddToCart={
        canUseConfiguredCart
          ? (product, quantity) =>
              addItem(product.id, quantity, product.existencias)
          : undefined
      }
    />
  )
}

export function DemoProductDetailPage() {
  const { state } = useDemoSession()
  const { addItem } = useCart()
  const canUseConfiguredCart = areIntegrationModesAligned()

  return (
    <ProductDetailPage
      accreditation={getDemoAccreditation(state)}
      onAddToCart={
        canUseConfiguredCart
          ? (product, quantity) =>
              addItem(product.id, quantity, product.existencias)
          : undefined
      }
    />
  )
}

export function DemoCartPage() {
  const { state } = useDemoSession()
  return <CartPage accreditation={getDemoAccreditation(state)} />
}

export function DemoCheckoutPage() {
  const { state } = useDemoSession()
  return <CheckoutPage accreditation={getDemoAccreditation(state)} />
}

export function DemoPaymentResultPage() {
  const { state } = useDemoSession()
  return <PaymentResultPage accreditation={getDemoAccreditation(state)} />
}

export interface DemoDashboardLayoutProps {
  readonly fallbackRole: DashboardRole
}

export function DemoDashboardLayout({
  fallbackRole,
}: DemoDashboardLayoutProps) {
  const { signOut, user } = useAuth()
  const cart = useCart()
  const simulatedRole = user?.rol
  const role =
    simulatedRole === 'vendedor' || simulatedRole === 'administrador'
      ? simulatedRole
      : fallbackRole

  return <DashboardLayout cartItemCount={cart.itemCount} cartStatus={cart.status} onSignOut={signOut} role={role} />
}
