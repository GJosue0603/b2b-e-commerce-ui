import { useRef, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
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
}

export function StoreHeader({
  authenticated = false,
  cartItemCount = 0,
  cartStatus = 'success',
}: StoreHeaderProps) {
  const mobileMenu = useRef<HTMLDetailsElement>(null)
  const navigation = authenticated
    ? buyerStoreNavigation
    : publicStoreNavigation
  const headerNavigation = navigation.filter(
    (item) => item.to !== routePatterns.home,
  )
  const accountPath = authenticated
    ? routePatterns.account
    : routePatterns.signIn
  const accountLabel = authenticated ? 'Mi cuenta' : 'Ingresar'
  const cartLabel =
    cartStatus === 'loading'
      ? 'Carrito, cargando productos'
      : `Carrito, ${cartItemCount} ${cartItemCount === 1 ? 'producto' : 'productos'}`

  const closeMobileMenu = () => mobileMenu.current?.removeAttribute('open')
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
          <NavigationLinks items={headerNavigation} />
        </nav>

        <StoreSearchForm className="store-header__search" />

        <div className="store-header__actions">
          <Link
            className="header-action header-action--account"
            to={accountPath}
          >
            <AccountIcon />
            <span>{accountLabel}</span>
          </Link>
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
                <NavigationLinks items={headerNavigation} />
                <Link className="navigation-link" to={accountPath}>
                  {accountLabel}
                </Link>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
