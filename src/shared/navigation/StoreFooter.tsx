import { Link } from 'react-router-dom'
import { routePatterns } from '../../app/router/paths'
import type { RolUsuario } from '../../domain'

export interface StoreFooterProps {
  authenticated?: boolean
  role?: RolUsuario
}

export function StoreFooter({ authenticated = false, role = 'comprador' }: StoreFooterProps) {
  return (
    <footer className="store-footer">
      <div className="container store-footer__content">
        <div className="store-footer__brand">
          <Link className="store-footer__brand-link" to={routePatterns.home}>
            <span aria-hidden="true" className="brand-link__mark">N</span>
            <strong>Nexo<span>Tech</span></strong>
          </Link>
          <p>
            Hardware, infraestructura y soluciones confiables para personas y
            empresas.
          </p>
          <span className="store-footer__pyme-badge">
            <span aria-hidden="true">●</span> Programa PYME Costa Rica
          </span>
          <small className="store-footer__session">
            {authenticated
              ? `Sesión de ${role} activa`
              : 'Compra como visitante o inicia sesión'}
          </small>
        </div>

        <section className="store-footer__group">
          <h2>Compras &amp; Catálogo</h2>
          <nav aria-label="Compras y catálogo">
            <Link to={routePatterns.catalog}>Explorar productos</Link>
            <Link to={routePatterns.cart}>Carrito de compras</Link>
            <Link to={routePatterns.orders}>Mis pedidos</Link>
          </nav>
        </section>

        <section className="store-footer__group">
          <h2>Empresas y PYMES</h2>
          <nav aria-label="Empresas y PYMES">
            <Link to={routePatterns.accreditationStatus}>Acreditación PYME</Link>
            <span>Facturación electrónica</span>
            <span>Soporte y garantías</span>
          </nav>
        </section>

        <section className="store-footer__group store-footer__contact">
          <h2>Sede Central</h2>
          <address>
            <span>San José, Costa Rica</span>
            <a href="mailto:soporte@nexotech.cr">soporte@nexotech.cr</a>
            <span>Lun–Vie · 8:00–17:00</span>
          </address>
        </section>
      </div>
      <div className="container store-footer__legal">
        <small>© {new Date().getFullYear()} NexoTech. Todos los derechos reservados.</small>
        <div aria-label="Información legal">
          <span>Términos</span>
          <span>Privacidad</span>
          <span>Seguridad</span>
        </div>
      </div>
    </footer>
  )
}
