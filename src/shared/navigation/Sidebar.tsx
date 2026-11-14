import { NavigationLinks } from './NavigationLinks'
import type { DashboardRole, NavigationItem } from './navigation'
import { getRoleLabel } from './navigation'

export interface SidebarProps {
  items: readonly NavigationItem[]
  role: DashboardRole
}

export function Sidebar({ items, role }: SidebarProps) {
  const roleLabel = getRoleLabel(role)
  const navigationLabel = `Navegación de ${roleLabel}`

  return (
    <>
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__brand">
          <span aria-hidden="true">N</span>
          <div><strong>NexoTech</strong><small>{roleLabel} Studio</small></div>
        </div>
        <span className="dashboard-sidebar__label">Gestión comercial</span>
        <nav aria-label={navigationLabel}>
          <NavigationLinks items={items} />
        </nav>
        <div className="dashboard-sidebar__profile">
          <span aria-hidden="true">●</span>
          <div><strong>Cuenta {roleLabel}</strong><small>Sesión autorizada</small></div>
        </div>
      </aside>

      <details className="dashboard-mobile-navigation">
        <summary>Menú de {roleLabel}</summary>
        <nav aria-label={`${navigationLabel} móvil`}>
          <NavigationLinks items={items} />
        </nav>
      </details>
    </>
  )
}
