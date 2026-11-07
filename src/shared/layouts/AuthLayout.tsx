import { Link, Outlet } from 'react-router-dom'
import { routePatterns } from '../../app/router/paths'

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <section className="auth-layout__form" aria-label="Acceso a NexoTech">
        <Link className="brand-link" to={routePatterns.home}>
          NexoTech
        </Link>
        <div className="auth-layout__outlet">
          <Outlet />
        </div>
      </section>
      <aside className="auth-layout__benefits">
        <div>
          <p className="auth-layout__eyebrow">Experiencia NexoTech</p>
          <h2>Tecnología garantizada para tu día a día y tu negocio</h2>
          <p>
            Toda cuenta inicia como Comprador. La acreditación PYME es un
            beneficio sujeto a revisión, no un rol independiente.
          </p>
          <ul className="auth-layout__benefit-list">
            <li>Garantía local directa</li>
            <li>Facturación electrónica demostrativa</li>
            <li>Seguimiento de pedidos confirmados</li>
            <li>Acreditación PYME opcional</li>
          </ul>
          <Link className="auth-layout__store-link" to={routePatterns.home}>
            Volver a la tienda
          </Link>
        </div>
      </aside>
    </main>
  )
}
