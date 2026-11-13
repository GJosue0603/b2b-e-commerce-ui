import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { routePatterns } from '../../app/router/paths'
import { NavigationLinks } from './NavigationLinks'
import { AccountIcon, CartIcon, MenuIcon } from './StoreIcons'
import { StoreSearchForm } from './StoreSearchForm'
import {
  buyerStoreNavigation,
  publicStoreNavigation,
} from './navigation'

export interface StoreHeaderProps {
  readonly authenticated?: boolean
  readonly cartItemCount?: number
  readonly cartStatus?: 'loading' | 'success' | 'error'
  readonly onSignOut?: () => Promise<void> | void
}

export function StoreHeader({
  authenticated = false,
  cartItemCount = 0,
  cartStatus = 'success',
  onSignOut,
}: StoreHeaderProps) {
  const navigate = useNavigate()
  const accountMenu = useRef<HTMLDetailsElement>(null)
  const mobileMenu = useRef<HTMLDetailsElement>(null)
  const [signingOut, setSigningOut] = useState(false)
  const navigation = authenticated
    ? buyerStoreNavigation
    : publicStoreNavigation
  const accountPath = authenticated
    ? routePatterns.account
    : routePatterns.signIn
  const accountLabel = authenticated ? 'Mi cuenta' : 'Ingresar'
  const cartLabel =
    cartStatus === 'loading'
      ? 'Carrito, cargando productos'
      : `Carrito, ${cartItemCount} ${cartItemCount === 1 ? 'producto' : 'productos'}`

  const closeMobileMenu = () => mobileMenu.current?.removeAttribute('open')
  const closeAccountMenu = () => accountMenu.current?.removeAttribute('open')
  const handleSignOut = async () => {
    if (!onSignOut || signingOut) return
    setSigningOut(true)
    closeAccountMenu()
    closeMobileMenu()
    try {
      await onSignOut()
      navigate(routePatterns.home, { replace: true })
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

  useEffect(() => {
    const closeOnOutsideInteraction = (event: PointerEvent) => {
      if (!accountMenu.current?.contains(event.target as Node)) {
        closeAccountMenu()
      }
    }
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') closeAccountMenu()
    }
    document.addEventListener('pointerdown', closeOnOutsideInteraction)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideInteraction)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

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
            <details className="account-menu" ref={accountMenu}>
              <summary className="header-action header-action--account">
                <AccountIcon />
                <span>{accountLabel}</span>
              </summary>
              <div className="account-menu__panel">
                <Link onClick={closeAccountMenu} to={routePatterns.account}>
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
          <Link
            aria-busy={cartStatus === 'loading' || undefined}
            aria-label={cartLabel}
            className="header-action header-action--cart"
            title={cartStatus === 'error' ? 'No se pudo consultar el carrito' : undefined}
            to={routePatterns.cart}
          >
            <CartIcon />
            <span aria-hidden="true" className="cart-count">
              {cartStatus === 'loading' ? '…' : cartItemCount}
            </span>
          </Link>

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
