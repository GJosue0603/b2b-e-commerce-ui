import { Outlet } from 'react-router-dom'
import type { CartLinkProps } from '../navigation/CartLink'
import {
  getDashboardNavigation,
  DashboardHeader,
  type DashboardRole,
  type NavigationItem,
} from '../navigation'

export interface DashboardLayoutProps extends CartLinkProps {
  navigation?: readonly NavigationItem[]
  onSignOut: () => Promise<void> | void
  role: DashboardRole
}

export function DashboardLayout({
  navigation,
  onSignOut,
  role,
  cartItemCount,
  cartStatus,
}: DashboardLayoutProps) {
  const items = navigation ?? getDashboardNavigation(role)

  return (
    <div className="dashboard-layout">
      <DashboardHeader
        items={items}
        onSignOut={onSignOut}
        role={role}
        cartItemCount={cartItemCount}
        cartStatus={cartStatus}
      />
      <main className="dashboard-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
