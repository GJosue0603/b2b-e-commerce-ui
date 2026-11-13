import { Link, useLocation } from 'react-router-dom'
import { routePatterns } from '../app/router/paths'
import { Badge, type BadgeVariant } from '../shared/ui'
import './route-placeholder.css'

export type RouteAudience =
  | 'Público'
  | 'Comprador'
  | 'Vendedor'
  | 'Administrador'

export interface RoutePlaceholderProps {
  audience: RouteAudience
  description: string
  title: string
}

const audienceVariant: Record<RouteAudience, BadgeVariant> = {
  Público: 'neutral',
  Comprador: 'primary',
  Vendedor: 'success',
  Administrador: 'warning',
}

export function RoutePlaceholder({
  audience,
  description,
  title,
}: RoutePlaceholderProps) {
  const location = useLocation()

  return (
    <section className="route-placeholder">
      <div className="route-placeholder__meta">
        <Badge variant={audienceVariant[audience]}>{audience}</Badge>
        <code>{location.pathname}</code>
      </div>
      <h1>{title}</h1>
      <p>{description}</p>
      <p className="route-placeholder__notice">
        Ruta preparada. La funcionalidad se implementará en su subissue.
      </p>
    </section>
  )
}

export function NotFoundPage() {
  return (
    <main className="not-found">
      <header className="container not-found__header">
        <Link aria-label="NexoTech, ir al inicio" className="not-found__brand" to={routePatterns.home}>
          <span aria-hidden="true" className="not-found__brand-mark">N</span>
          <span>Nexo<strong>Tech</strong></span>
        </Link>
      </header>

      <section className="container not-found__content" aria-labelledby="not-found-title">
        <div className="not-found__illustration" aria-hidden="true">
          <div className="not-found__orb not-found__orb--one" />
          <div className="not-found__orb not-found__orb--two" />
          <svg viewBox="0 0 360 300" role="presentation">
            <path className="not-found__shadow" d="M55 261c0-18 56-33 125-33s125 15 125 33-56 27-125 27S55 279 55 261Z" />
            <path className="not-found__device" d="M92 62h176a14 14 0 0 1 14 14v134H78V76a14 14 0 0 1 14-14Z" />
            <path className="not-found__screen" d="M98 84h164v105H98z" />
            <path className="not-found__base" d="M62 210h236l-13 22a18 18 0 0 1-16 9H91a18 18 0 0 1-16-9l-13-22Z" />
            <path className="not-found__line" d="M152 224h56" />
            <circle className="not-found__signal" cx="180" cy="133" r="33" />
            <path className="not-found__question" d="M167 124c1-9 7-14 16-14 10 0 17 6 17 15 0 8-5 11-11 15-6 3-8 7-8 13M181 166h.01" />
            <path className="not-found__spark" d="m65 91 8 8m-8 0 8-8m211 64 8 8m-8 0 8-8M55 173h14m220-67h15" />
          </svg>
        </div>

        <div className="not-found__copy">
          <p className="not-found__eyebrow">Error 404</p>
          <h1 id="not-found-title">Página no encontrada</h1>
          <p className="not-found__description">
            Parece que esta dirección no existe o fue movida. Puedes volver al
            inicio o seguir explorando nuestro catálogo de tecnología.
          </p>
          <div className="not-found__actions">
            <Link className="not-found__action not-found__action--primary" to={routePatterns.home}>
              <span aria-hidden="true">←</span>
              Volver al inicio
            </Link>
            <Link className="not-found__action not-found__action--secondary" to={routePatterns.catalog}>
              Explorar catálogo
            </Link>
          </div>
        </div>
      </section>

      <footer className="container not-found__footer">
        <span>© NexoTech</span>
        <span>Compra segura · Soporte confiable</span>
      </footer>
    </main>
  )
}
