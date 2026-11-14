import { useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { routePatterns } from '../../app/router/paths'
import { NavigationLinks } from './NavigationLinks'
import { AccountIcon, MenuIcon } from './StoreIcons'
import { CartLink } from './CartLink'
import { StoreSearchForm } from './StoreSearchForm'
import { AccountMenu } from './AccountMenu'
import {
  buyerStoreNavigation,
  publicStoreNavigation,
} from './navigation'

export interface StoreHeaderProps {
  readonly authenticated?: boolean
  readonly cartItemCount?: number
  readonly cartStatus?: 'loading' | 'success' | 'error' | 'unauthenticated'
  readonly showAccreditationNavigation?: boolean
  readonly onSignOut?: () => Promise<void> | void
}

export function StoreHeader({
  authenticated = false,
  cartItemCount = 0,
  cartStatus = 'success',
  showAccreditationNavigation = true,
  onSignOut,
}: StoreHeaderProps) {
  const navigate = useNavigate()
  const mobileMenu = useRef<HTMLDetailsElement>(null)
  const [signingOut, setSigningOut] = useState(false)
  const navigation = !authenticated
    ? publicStoreNavigation
    : showAccreditationNavigation
      ? buyerStoreNavigation
      : buyerStoreNavigation.filter(
          ({ to }) => to !== routePatterns.accreditationStatus,
        )
  const accountPath = authenticated
    ? routePatterns.account
    : routePatterns.signIn
  const accountLabel = authenticated ? 'Mi cuenta' : 'Ingresar'

  const closeMobileMenu = () => mobileMenu.current?.removeAttribute('open')
  const handleSignOut = async () => {
    if (!onSignOut || signingOut) return
    setSigningOut(true)
    closeMobileMenu()
    try {
      await onSignOut()
      navigate(routePatterns.signIn, { replace: true })
    } finally {
      setSigningOut(false)
    }
  }
  const handleMenuKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    if (mobileMenu.current) {
      mobileMenu.current.open = !mobileMenu.current.open
    }
  }

  return (
    <header className="store-header">
      <div className="container store-header__content">
        <Link className="brand-link" to={routePatterns.home}>
          <span aria-hidden="true" className="brand-link__mark">
            N
          </span>
          <span>
            Nexo<strong>Tech</strong>
          </span>
        </Link>

        <nav aria-label="Navegación de la tienda" className="store-header__nav">
          <NavigationLinks items={navigation} />
        </nav>

        <StoreSearchForm className="store-header__search" />

        <div className="store-header__actions">
          {authenticated ? (
            <AccountMenu accountPath={routePatterns.account} label={accountLabel} onSignOut={handleSignOut} signingOut={signingOut} />
          ) : (
            <Link
              aria-label="Ingresar"
              className="header-action header-action--account header-action--icon-only"
              title="Ingresar"
              to={accountPath}
            >
              <AccountIcon />
            </Link>
          )}
          <CartLink cartItemCount={cartItemCount} cartStatus={cartStatus} />

          <details className="store-header__mobile-menu" ref={mobileMenu}>
            <summary aria-label="Abrir menú" onKeyDown={handleMenuKeyDown}>
              <MenuIcon />
            </summary>
            <div className="store-header__mobile-panel">
              <StoreSearchForm onSubmit={closeMobileMenu} />
              <nav
                aria-label="Navegación móvil de la tienda"
                onClick={closeMobileMenu}
              >
                <NavigationLinks items={navigation} />
                {authenticated ? (
                  <>
                    <Link className="navigation-link" to={routePatterns.account}>
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
                  </>
                ) : (
                  <Link className="navigation-link" to={accountPath}>
                    {accountLabel}
                  </Link>
                )}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
