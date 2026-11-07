import { Outlet } from 'react-router-dom'
import { StoreFooter, StoreHeader } from '../navigation'

export interface StoreLayoutProps {
  authenticated?: boolean
}

export function StoreLayout({ authenticated = false }: StoreLayoutProps) {
  return (
    <div className="store-layout">
      <StoreHeader authenticated={authenticated} />
      <main className="store-layout__content">
        <Outlet />
      </main>
      <StoreFooter authenticated={authenticated} />
    </div>
  )
}
