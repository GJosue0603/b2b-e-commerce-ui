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
import { useDemoSession } from './useDemoSession'

export function DemoStoreLayout() {
  const { signOut, user } = useAuth()
  const { state } = useDemoSession()
  const cart = useCart()
  const authenticated = user?.rol === 'comprador'
  const showAccreditationNavigation =
    state.status === 'success' &&
    state.data.session.scenario.id !== 'buyer-regular'

  return (
    <StoreLayout
      authenticated={authenticated}
      cartItemCount={cart.itemCount}
      cartStatus={cart.status}
      showAccreditationNavigation={showAccreditationNavigation}
      onSignOut={signOut}
    />
  )
}

export function DemoHomePage() {
  const { state } = useDemoSession()
  const accreditation =
    state.status === 'success' ? state.data.session.accreditation : null

  return <HomePage accreditation={accreditation} />
}

export function DemoCatalogPage() {
  const { state } = useDemoSession()
  const { addItem } = useCart()
  const accreditation =
    state.status === 'success' ? state.data.session.accreditation : null

  return (
    <CatalogPage
      accreditation={accreditation}
      onAddToCart={(product, quantity) =>
        addItem(product.id, quantity, product.existencias)
      }
    />
  )
}

export function DemoProductDetailPage() {
  const { state } = useDemoSession()
  const { addItem } = useCart()
  const accreditation =
    state.status === 'success' ? state.data.session.accreditation : null

  return (
    <ProductDetailPage
      accreditation={accreditation}
      onAddToCart={(product, quantity) =>
        addItem(product.id, quantity, product.existencias)
      }
    />
  )
}

export function DemoCartPage() {
  const { state } = useDemoSession()
  const accreditation =
    state.status === 'success' ? state.data.session.accreditation : null

  return <CartPage accreditation={accreditation} />
}

export function DemoCheckoutPage() {
  const { state } = useDemoSession()
  const accreditation =
    state.status === 'success' ? state.data.session.accreditation : null

  return <CheckoutPage accreditation={accreditation} />
}

export function DemoPaymentResultPage() {
  const { state } = useDemoSession()
  const accreditation =
    state.status === 'success' ? state.data.session.accreditation : null

  return <PaymentResultPage accreditation={accreditation} />
}

export interface DemoDashboardLayoutProps {
  readonly fallbackRole: DashboardRole
}

export function DemoDashboardLayout({
  fallbackRole,
}: DemoDashboardLayoutProps) {
  const { signOut, user } = useAuth()
  const simulatedRole = user?.rol
  const role =
    simulatedRole === 'vendedor' || simulatedRole === 'administrador'
      ? simulatedRole
      : fallbackRole

  return <DashboardLayout onSignOut={signOut} role={role} />
}
