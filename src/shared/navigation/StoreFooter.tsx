import { Link } from 'react-router-dom'
import { routePatterns } from '../../app/router/paths'

export interface StoreFooterProps {
  authenticated?: boolean
}

export function StoreFooter({ authenticated = false }: StoreFooterProps) {
  return (
    <footer className="store-footer">
      <div className="container store-footer__content">
        <div>
          <strong>NexoTech</strong>
          <p>Tecnología para tu día a día y tu negocio.</p>
        </div>
        <nav aria-label="Enlaces del pie de página">
          <Link to={routePatterns.catalog}>Catálogo</Link>
          <Link to={authenticated ? routePatterns.account : routePatterns.signIn}>
            {authenticated ? 'Mi cuenta' : 'Ingresar'}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
