import { Link } from 'react-router-dom'
import { routePatterns } from '../../app/router/paths'

export interface StoreFooterProps {
  authenticated?: boolean
}

export function StoreFooter({ authenticated = false }: StoreFooterProps) {
  return (
    <footer className="store-footer">
      <div className="container store-footer__content">
        <div className="store-footer__brand">
          <strong>
            Nexo<span>Tech</span>
          </strong>
          <p>Hardware, infraestructura y soluciones confiables para personas y empresas.</p>
          <small>◉ Programa PYME Costa Rica</small>
        </div>
        <nav aria-label="Compras y catálogo">
          <strong>Compras &amp; Catálogo</strong>
          <Link to={routePatterns.catalog}>Explorar productos</Link>
          <Link to={routePatterns.cart}>Carrito de compras</Link>
          <Link to={authenticated ? routePatterns.orders : routePatterns.signIn}>Mis pedidos</Link>
        </nav>
        <nav aria-label="Empresas y PYMES">
          <strong>Empresas y PYMES</strong>
          <Link to={routePatterns.accreditationStatus}>Acreditación PYME</Link>
          <span>Facturación electrónica</span>
          <span>Soporte y garantías</span>
        </nav>
        <div className="store-footer__contact">
          <strong>Sede Central</strong>
          <span>San José, Costa Rica</span>
          <span>soporte@nexotech.cr</span>
          <span>Lun–Vie · 8:00–17:00</span>
        </div>
      </div>
      <div className="container store-footer__legal">
        <small>© {new Date().getFullYear()} NexoTech. Todos los derechos reservados.</small>
        <span>Términos · Privacidad · Seguridad</span>
      </div>
    </footer>
  )
}
