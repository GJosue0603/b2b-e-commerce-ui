import { Outlet } from 'react-router-dom'
import { StoreFooter, StoreHeader } from '../navigation'

export interface StoreLayoutProps {
  readonly authenticated?: boolean
  readonly cartItemCount?: number
  readonly cartStatus?: 'loading' | 'success' | 'error'
  readonly showAccreditationNavigation?: boolean
  readonly onSignOut?: () => Promise<void> | void
}

export function StoreLayout({
  authenticated = false,
  cartItemCount = 0,
  cartStatus = 'success',
  showAccreditationNavigation = true,
  onSignOut,
}: StoreLayoutProps) {
  return (
    <div className="store-layout">
      <StoreHeader
        authenticated={authenticated}
        cartItemCount={cartItemCount}
        cartStatus={cartStatus}
        showAccreditationNavigation={showAccreditationNavigation}
        onSignOut={onSignOut}
      />
      <main className="store-layout__content">
        <Outlet />
      </main>
      <StoreFooter authenticated={authenticated} />
    </div>
  )
}
