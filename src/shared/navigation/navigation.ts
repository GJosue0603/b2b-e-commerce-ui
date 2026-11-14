import { routePatterns } from '../../app/router/paths'
import type { RolUsuario } from '../../domain'

export type NavigationRole = RolUsuario
export type DashboardRole = Exclude<NavigationRole, 'comprador'>

export interface NavigationItem {
  label: string
  to: string
}

export const publicStoreNavigation: readonly NavigationItem[] = [
  { label: 'Inicio', to: routePatterns.home },
  { label: 'Catálogo', to: routePatterns.catalog },
]

export const buyerStoreNavigation: readonly NavigationItem[] = [
  ...publicStoreNavigation,
  { label: 'Mis pedidos', to: routePatterns.orders },
  { label: 'Acreditación PYME', to: routePatterns.accreditationStatus },
]

const sellerNavigation: readonly NavigationItem[] = [
  { label: 'Productos', to: routePatterns.sellerProducts },
  { label: 'Reportes', to: routePatterns.sellerReports },
]

const administratorNavigation: readonly NavigationItem[] = [
  { label: 'Solicitudes PYME', to: routePatterns.adminAccreditations },
  { label: 'Usuarios', to: routePatterns.adminUsers },
  { label: 'Categorías', to: routePatterns.adminCategories },
  { label: 'Productos', to: routePatterns.adminProducts },
  { label: 'Pedidos', to: routePatterns.adminOrders },
  { label: 'Reportes', to: routePatterns.adminReports },
]

export function getDashboardNavigation(
  role: DashboardRole,
): readonly NavigationItem[] {
  return role === 'vendedor' ? sellerNavigation : administratorNavigation
}

export function getRoleLabel(role: NavigationRole) {
  const labels: Record<NavigationRole, string> = {
    comprador: 'Comprador',
    vendedor: 'Vendedor',
    administrador: 'Administrador',
  }

  return labels[role]
}
