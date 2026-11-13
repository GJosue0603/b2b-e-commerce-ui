import { Link, Outlet, useLocation } from 'react-router-dom'
import { routePatterns } from '../../app/router/paths'

export function AuthLayout() {
  const { pathname } = useLocation()
  const registering = pathname === routePatterns.signUp

  return (
    <div className={`auth-shell${registering ? ' auth-shell--register' : ''}`}>
      <header className="auth-shell__header">
        <div className="container">
          <Link className="brand-link" to={routePatterns.home}>
            <span aria-hidden="true" className="brand-link__mark">N</span>
            <span>Nexo<strong>Tech</strong></span>
          </Link>
          <nav aria-label="Navegación de acceso">
            <Link to={routePatterns.home}>Volver a la tienda</Link>
            <span>Soporte</span>
            <span aria-hidden="true" className="auth-shell__avatar">●</span>
          </nav>
        </div>
      </header>

      <main className="auth-layout container">
        <section className="auth-layout__form" aria-label="Acceso a NexoTech">
          <div className="auth-layout__outlet"><Outlet /></div>
        </section>
        <AuthBenefits registering={registering} />
      </main>

      <footer className="auth-shell__footer">
        <div className="container">
          <small>© {new Date().getFullYear()} NexoTech Technologies S.I.</small>
          <nav aria-label="Información legal">
            <span>Términos del servicio</span>
            <span>Privacidad</span>
            <span>Seguridad empresarial</span>
          </nav>
        </div>
      </footer>
    </div>
  )
}

function AuthBenefits({ registering }: { readonly registering: boolean }) {
  const items = registering
    ? [
        ['▣', 'Seguimiento en tiempo real', 'Controla cada etapa de tus órdenes, guías y entregas.'],
        ['▤', 'Facturación electrónica automática', 'Descarga comprobantes válidos para Hacienda.'],
        ['✓', 'Acreditación PYME opcional', 'Accede a precios preferenciales sin costo adicional.'],
        ['⌁', 'Soporte técnico experto', 'Recibe asesoría de compatibilidad y garantía.'],
      ]
    : [
        ['▣', 'Garantía local directa', 'Cobertura oficial con técnicas certificadas.'],
        ['▤', 'Facturación electrónica inmediata', 'Comprobantes oficiales para personas y empresas.'],
        ['▱', 'Envíos en 24–48h', 'Despacho prioritario y rastreo en Costa Rica.'],
        ['✓', 'Beneficio PYME disponible', 'Solicita acreditación y accede a precios preferenciales.'],
      ]

  return (
    <aside className="auth-layout__benefits">
      <div>
        <p className="auth-layout__eyebrow">
          {registering ? 'Experiencia NexoTech Comprador' : 'Tu cuenta Comprador en NexoTech'}
        </p>
        <h2>
          {registering
            ? 'Compra hardware confiable con respaldo total'
            : 'Tecnología garantizada para tu día a día y tu negocio'}
        </h2>
        <p>
          Una sola identidad para explorar el catálogo, comprar y administrar
          tus pedidos con respaldo local.
        </p>
        <ul className="auth-layout__benefit-list">
          {items.map(([icon, title, description]) => (
            <li key={title}>
              <span aria-hidden="true">{icon}</span>
              <div><strong>{title}</strong><small>{description}</small></div>
            </li>
          ))}
        </ul>
        <p className="auth-layout__note">
          Toda cuenta inicia como Comprador. La acreditación PYME es un beneficio opcional.
        </p>
      </div>
    </aside>
  )
}
