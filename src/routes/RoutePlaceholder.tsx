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
    <main className="container route-placeholder route-placeholder--centered">
      <Badge variant="warning">404</Badge>
      <h1>Página no encontrada</h1>
      <p>La ruta solicitada no forma parte de la navegación de NexoTech.</p>
      <Link className="route-placeholder__link" to={routePatterns.home}>
        Volver al inicio
      </Link>
    </main>
  )
}
