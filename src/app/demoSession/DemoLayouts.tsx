import type { DashboardRole } from '../../shared/navigation'
import { DashboardLayout, StoreLayout } from '../../shared/layouts'
import { useCartSummary } from '../../features/cart/useCartSummary'
import { HomePage } from '../../features/store/pages/HomePage'
import { useDemoSession } from './useDemoSession'

export function DemoStoreLayout() {
  const { state } = useDemoSession()
  const buyerId =
    state.status !== 'success'
      ? undefined
      : state.data.session.user?.rol === 'comprador'
        ? state.data.session.user.id
        : null
  const cart = useCartSummary(buyerId)
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
