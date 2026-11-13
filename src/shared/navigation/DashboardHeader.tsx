import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { routePatterns } from '../../app/router/paths'
import { AccountIcon, MenuIcon } from './StoreIcons'
import { NavigationLinks } from './NavigationLinks'
import type { DashboardRole, NavigationItem } from './navigation'
import { getRoleLabel } from './navigation'

export interface DashboardHeaderProps {
  readonly items: readonly NavigationItem[]
  readonly onSignOut: () => Promise<void> | void
  readonly role: DashboardRole
}

export function DashboardHeader({
  items,
  onSignOut,
  role,
}: DashboardHeaderProps) {
  const navigate = useNavigate()
  const accountMenu = useRef<HTMLDetailsElement>(null)
  const mobileMenu = useRef<HTMLDetailsElement>(null)
  const [signingOut, setSigningOut] = useState(false)
  const roleLabel = getRoleLabel(role)
  const accountPath =
    role === 'vendedor'
      ? routePatterns.sellerAccount
      : routePatterns.adminAccount
  const navigationLabel = `Navegación de ${roleLabel}`

  const closeMobileMenu = () => mobileMenu.current?.removeAttribute('open')
  const closeAccountMenu = () => accountMenu.current?.removeAttribute('open')
  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    closeAccountMenu()
    closeMobileMenu()
    try {
      navigate(routePatterns.home, { replace: true })
      await onSignOut()
    } finally {
      setSigningOut(false)
    }
  }

  useEffect(() => {
    const closeOnOutsideInteraction = (event: PointerEvent) => {
      if (!accountMenu.current?.contains(event.target as Node)) {
        closeAccountMenu()
      }
    }
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAccountMenu()
        closeMobileMenu()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideInteraction)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideInteraction)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

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
          <NavigationLinks items={items} />
        </nav>

        <div className="store-header__actions dashboard-header__actions">
          <details className="account-menu" ref={accountMenu}>
            <summary
              aria-label={`Cuenta de ${roleLabel}`}
              className="header-action header-action--account header-action--icon-only"
              title={`Cuenta de ${roleLabel}`}
            >
              <AccountIcon />
            </summary>
            <div className="account-menu__panel">
              <Link onClick={closeAccountMenu} to={accountPath}>
                Ver cuenta
              </Link>
              <button
                disabled={signingOut}
                onClick={() => void handleSignOut()}
                type="button"
              >
                {signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
              </button>
            </div>
          </details>

          <details className="store-header__mobile-menu" ref={mobileMenu}>
            <summary aria-label={`Abrir menú de ${roleLabel}`}>
              <MenuIcon />
            </summary>
            <div className="store-header__mobile-panel dashboard-header__mobile-panel">
              <nav
                aria-label={`${navigationLabel} móvil`}
                onClick={closeMobileMenu}
              >
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
