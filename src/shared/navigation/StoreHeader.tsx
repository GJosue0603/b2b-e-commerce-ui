import { Link } from 'react-router-dom'
import { routePatterns } from '../../app/router/paths'
import { NavigationLinks } from './NavigationLinks'
import {
  buyerStoreNavigation,
  publicStoreNavigation,
} from './navigation'

export interface StoreHeaderProps {
  authenticated?: boolean
}

export function StoreHeader({ authenticated = false }: StoreHeaderProps) {
  const navigation = authenticated
    ? buyerStoreNavigation
    : publicStoreNavigation

  return (
    <header className="store-header">
      <div className="container store-header__content">
        <Link className="brand-link" to={routePatterns.home}>
          NexoTech
        </Link>

        <nav aria-label="Navegación de la tienda" className="store-header__nav">
          <NavigationLinks items={navigation} />
        </nav>

        <details className="store-header__mobile-menu">
          <summary>Menú</summary>
          <nav aria-label="Navegación móvil de la tienda">
            <NavigationLinks items={navigation} />
          </nav>
        </details>

        <div className="store-header__actions">
          <Link
            className="header-action"
            to={authenticated ? routePatterns.account : routePatterns.signIn}
          >
            {authenticated ? 'Mi cuenta' : 'Ingresar'}
          </Link>
          <Link className="header-action" to={routePatterns.cart}>
            Carrito <span aria-label="0 productos">0</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
