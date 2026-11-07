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
        <div className="dashboard-sidebar__brand">NexoTech</div>
        <nav aria-label={navigationLabel}>
          <NavigationLinks items={items} />
        </nav>
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
