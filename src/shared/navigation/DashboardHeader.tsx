import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { routePatterns } from '../../app/router/paths'
import { MenuIcon } from './StoreIcons'
import { AccountMenu } from './AccountMenu'
import { CartLink, type CartLinkProps } from './CartLink'
import { NavigationLinks } from './NavigationLinks'
import { ManagementMenu } from './ManagementMenu'
import type { DashboardRole, NavigationItem } from './navigation'
import { getRoleLabel, publicStoreNavigation } from './navigation'

export interface DashboardHeaderProps extends CartLinkProps {
  readonly items: readonly NavigationItem[]
  readonly onSignOut: () => Promise<void> | void
  readonly role: DashboardRole
}

export function DashboardHeader({
  items,
  onSignOut,
  role,
  cartItemCount,
  cartStatus,
}: DashboardHeaderProps) {
  const navigate = useNavigate()
  const mobileMenu = useRef<HTMLDetailsElement>(null)
  const [signingOut, setSigningOut] = useState(false)
  const roleLabel = getRoleLabel(role)
  const accountPath =
    role === 'vendedor'
      ? routePatterns.sellerAccount
      : routePatterns.adminAccount
  const navigationLabel = `Navegación de ${roleLabel}`
  const managementLabel = role === 'administrador' ? 'Administración' : 'Gestión de ventas'

  const closeMobileMenu = () => mobileMenu.current?.removeAttribute('open')
  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    closeMobileMenu()
    try {
      await onSignOut()
      navigate(routePatterns.signIn, { replace: true })
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <header className="store-header dashboard-header">
      <div className="container store-header__content">
        <Link className="brand-link" to={routePatterns.home}>
          <span aria-hidden="true" className="brand-link__mark">
            N
          </span>
          <span>
            Nexo<strong>Tech</strong>
          </span>
        </Link>

        <nav
          aria-label={navigationLabel}
          className="store-header__nav dashboard-header__nav"
        >
          <NavigationLinks items={publicStoreNavigation} />
          <ManagementMenu items={items} label={managementLabel} />
        </nav>

        <div className="store-header__actions dashboard-header__actions">
          <AccountMenu accountPath={accountPath} label={`Cuenta de ${roleLabel}`} onSignOut={handleSignOut} signingOut={signingOut} />
          <CartLink cartItemCount={cartItemCount} cartStatus={cartStatus} />

          <details className="store-header__mobile-menu" ref={mobileMenu}>
            <summary aria-label={`Abrir menú de ${roleLabel}`}>
              <MenuIcon />
            </summary>
            <div className="store-header__mobile-panel dashboard-header__mobile-panel">
              <nav
                aria-label={`${navigationLabel} móvil`}
                onClick={closeMobileMenu}
              >
                <NavigationLinks items={publicStoreNavigation} />
                <span className="management-menu__heading">{managementLabel}</span>
                <NavigationLinks items={items} />
                <Link className="navigation-link" to={accountPath}>
                  Ver cuenta
                </Link>
                <button
                  className="navigation-link account-menu__signout"
                  disabled={signingOut}
                  onClick={() => void handleSignOut()}
                  type="button"
                >
                  {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
                </button>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
