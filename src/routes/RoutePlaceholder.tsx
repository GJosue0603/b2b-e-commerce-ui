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
    <section className="container not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-card">
        <div className="not-found-card__illustration" aria-hidden="true">
          <div className="not-found-card__orb" />
          <svg viewBox="0 0 360 300" role="presentation">
            <path className="not-found-card__shadow" d="M55 261c0-18 56-33 125-33s125 15 125 33-56 27-125 27S55 279 55 261Z" />
            <path className="not-found-card__device" d="M92 62h176a14 14 0 0 1 14 14v134H78V76a14 14 0 0 1 14-14Z" />
            <path className="not-found-card__screen" d="M98 84h164v105H98z" />
            <path className="not-found-card__base" d="M62 210h236l-13 22a18 18 0 0 1-16 9H91a18 18 0 0 1-16-9l-13-22Z" />
            <path className="not-found-card__line" d="M152 224h56" />
            <circle className="not-found-card__signal" cx="180" cy="133" r="33" />
            <path className="not-found-card__question" d="M167 124c1-9 7-14 16-14 10 0 17 6 17 15 0 8-5 11-11 15-6 3-8 7-8 13M181 166h.01" />
            <path className="not-found-card__spark" d="m65 91 8 8m-8 0 8-8m211 64 8 8m-8 0 8-8M55 173h14m220-67h15" />
          </svg>
        </div>

        <div className="not-found-card__copy">
          <Badge variant="primary">Error 404</Badge>
          <h1 id="not-found-title">Página no encontrada</h1>
          <p className="not-found-card__description">
            Parece que esta dirección no existe o fue movida. Puedes volver al
            inicio o seguir explorando nuestro catálogo de tecnología.
          </p>
          <div className="not-found-card__actions">
            <Link className="ui-button ui-button--primary ui-button--md" to={routePatterns.home}>
              <span aria-hidden="true">←</span>
              <span>Volver al inicio</span>
            </Link>
            <Link className="ui-button ui-button--ghost ui-button--md" to={routePatterns.catalog}>
              <span>Explorar catálogo</span>
            </Link>
          </div>
          <p className="not-found-card__hint">
            También puedes usar el buscador o la navegación superior para continuar.
          </p>
        </div>
      </div>
    </section>
  )
}
