import { Outlet } from 'react-router-dom'
import { Badge } from '../ui'
import {
  getDashboardNavigation,
  getRoleLabel,
  Sidebar,
  type DashboardRole,
  type NavigationItem,
} from '../navigation'

export interface DashboardLayoutProps {
  navigation?: readonly NavigationItem[]
  role: DashboardRole
}

export function DashboardLayout({
  navigation,
  role,
}: DashboardLayoutProps) {
  const items = navigation ?? getDashboardNavigation(role)
  const roleLabel = getRoleLabel(role)

  return (
    <div className="dashboard-layout">
      <Sidebar items={items} role={role} />
      <div className="dashboard-layout__workspace">
        <header className="dashboard-topbar">
          <div>
            <strong>Panel {roleLabel}</strong>
            <span>NexoTech Costa Rica</span>
          </div>
          <Badge variant={role === 'administrador' ? 'primary' : 'success'}>
            {roleLabel}
          </Badge>
        </header>
        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
