import { Link } from 'react-router-dom'
import { routePatterns } from '../../../app/router/paths'
import { Alert, EmptyState, Skeleton } from '../../../shared/ui'
import { useAuth } from '../../auth/state'
import { OrderDetail } from '../components'
import { useMyOrders } from '../hooks/useMyOrders'
import './orders-page.css'

export function MyOrdersPage() {
  const { authMode, user } = useAuth()
  const state = useMyOrders(authMode === 'demo' ? user?.id : undefined)

  if (authMode === 'api') {
    return (
      <div className="container orders-page">
        <header>
          <h1>Mis pedidos</h1>
        </header>
        <Alert title="Pedidos no disponibles en la API" variant="info">
          Este módulo solo consulta pedidos de pagos demostrativos. El backend
          aún no ofrece endpoints de pedidos ni pagos.
        </Alert>
      </div>
    )
  }

  return (
    <div className="container orders-page">
      <header>
        <h1>Mis pedidos</h1>
        <p>Solo aparecen compras asociadas a pagos simulados aprobados.</p>
      </header>
      {(state.status === 'idle' || state.status === 'loading') && (
        <div aria-label="Cargando pedidos" className="orders-page__list">
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
        </div>
      )}
      {state.status === 'error' && (
        <Alert title="No pudimos cargar tus pedidos" variant="danger">
          {state.error.message}
        </Alert>
      )}
      {state.status === 'success' && state.data.length === 0 && (
        <EmptyState
          action={<Link to={routePatterns.catalog}>Explorar productos</Link>}
          description="Cuando una compra tenga pago aprobado, aparecerá aquí."
          icon="◇"
          title="Todavía no tienes pedidos confirmados"
        />
      )}
      {state.status === 'success' && state.data.length > 0 && (
        <section aria-label="Pedidos confirmados" className="orders-page__list">
          {state.data.map(({ order, payment }) => (
            <OrderDetail key={order.id} order={order} payment={payment} />
          ))}
        </section>
      )}
    </div>
  )
}
