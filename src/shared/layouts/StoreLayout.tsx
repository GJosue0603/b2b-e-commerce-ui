import { Outlet } from 'react-router-dom'
import { DashboardHeader, getDashboardNavigation, StoreFooter, StoreHeader } from '../navigation'
import type { RolUsuario } from '../../domain'

export interface StoreLayoutProps {
  readonly authenticated?: boolean
  readonly role?: RolUsuario
  readonly cartItemCount?: number
  readonly cartStatus?: 'loading' | 'success' | 'error' | 'unauthenticated'
  readonly showAccreditationNavigation?: boolean
  readonly onSignOut?: () => Promise<void> | void
}

export function StoreLayout({
  authenticated = false,
  role,
  cartItemCount = 0,
  cartStatus = 'success',
  showAccreditationNavigation = true,
  onSignOut,
}: StoreLayoutProps) {
  return (
    <div className="store-layout">
      {authenticated && role && role !== 'comprador' ? (
        <DashboardHeader cartItemCount={cartItemCount} cartStatus={cartStatus} items={getDashboardNavigation(role)} onSignOut={onSignOut ?? (() => {})} role={role} />
      ) : (
        <StoreHeader
          authenticated={authenticated}
          cartItemCount={cartItemCount}
          cartStatus={cartStatus}
          showAccreditationNavigation={showAccreditationNavigation}
          onSignOut={onSignOut}
        />
      )}
      <main className="store-layout__content">
        <Outlet />
      </main>
      <StoreFooter authenticated={authenticated} role={role} />
    </div>
  )
}
