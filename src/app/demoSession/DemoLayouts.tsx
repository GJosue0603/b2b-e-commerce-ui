import type { DashboardRole } from '../../shared/navigation'
import { DashboardLayout, StoreLayout } from '../../shared/layouts'
import { useDemoSession } from './useDemoSession'

export function DemoStoreLayout() {
  const { state } = useDemoSession()
  const authenticated =
    state.status === 'success' && state.data.session.user?.rol === 'comprador'

  return <StoreLayout authenticated={authenticated} />
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
