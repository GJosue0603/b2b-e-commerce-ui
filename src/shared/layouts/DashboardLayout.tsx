import { Outlet } from 'react-router-dom'
import {
  getDashboardNavigation,
  DashboardHeader,
  type DashboardRole,
  type NavigationItem,
} from '../navigation'

export interface DashboardLayoutProps {
  navigation?: readonly NavigationItem[]
  onSignOut: () => Promise<void> | void
  role: DashboardRole
}

export function DashboardLayout({
  navigation,
  onSignOut,
  role,
}: DashboardLayoutProps) {
  const items = navigation ?? getDashboardNavigation(role)

  return (
    <div className="dashboard-layout">
      <DashboardHeader
        items={items}
        onSignOut={onSignOut}
        role={role}
      />
      <main className="dashboard-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
