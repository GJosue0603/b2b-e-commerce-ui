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
          <p className="auth-layout__eyebrow">Una sola tienda</p>
          <h2>Tecnología para personas y negocios</h2>
          <p>
            Toda cuenta inicia como Comprador. La acreditación PYME es un
            beneficio sujeto a revisión, no un rol independiente.
          </p>
        </div>
      </aside>
    </main>
  )
}
