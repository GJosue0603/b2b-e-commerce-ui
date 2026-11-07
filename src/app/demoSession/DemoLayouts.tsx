import type { DashboardRole } from '../../shared/navigation'
import { DashboardLayout, StoreLayout } from '../../shared/layouts'
import { useCart } from '../../features/cart/state'
import { CartPage } from '../../features/cart/pages/CartPage'
import { CatalogPage } from '../../features/catalog/pages/CatalogPage'
import { ProductDetailPage } from '../../features/catalog/pages/ProductDetailPage'
import { HomePage } from '../../features/store/pages/HomePage'
import { useDemoSession } from './useDemoSession'

export function DemoStoreLayout() {
  const { state } = useDemoSession()
  const cart = useCart()
  const authenticated =
    state.status === 'success' && state.data.session.user?.rol === 'comprador'

  return (
    <StoreLayout
      authenticated={authenticated}
      cartItemCount={cart.itemCount}
      cartStatus={cart.status}
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
  const accreditation =
    state.status === 'success' ? state.data.session.accreditation : null

  return <CatalogPage accreditation={accreditation} />
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

export interface DemoDashboardLayoutProps {
  readonly fallbackRole: DashboardRole
}

export function DemoDashboardLayout({
  fallbackRole,
}: DemoDashboardLayoutProps) {
  const { state } = useDemoSession()
  const simulatedRole =
    state.status === 'success' ? state.data.session.user?.rol : undefined
  const role =
    simulatedRole === 'vendedor' || simulatedRole === 'administrador'
      ? simulatedRole
      : fallbackRole

  return <DashboardLayout role={role} />
}
