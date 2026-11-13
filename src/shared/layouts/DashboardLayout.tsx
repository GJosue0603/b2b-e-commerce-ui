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
  userEmail?: string
  userName?: string
}

export function DashboardLayout({
  navigation,
  onSignOut,
  role,
  userEmail,
  userName,
}: DashboardLayoutProps) {
  const items = navigation ?? getDashboardNavigation(role)

  return (
    <div className="dashboard-layout">
      <DashboardHeader
        items={items}
        onSignOut={onSignOut}
        role={role}
        userEmail={userEmail}
        userName={userName}
      />
      <main className="dashboard-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
