import { useEffect, useMemo, useState } from 'react'
import { useAppServices } from '../../../app/services'
import type { Pago, Pedido, Usuario } from '../../../domain'
import { Alert, KpiCard, Skeleton, TextField } from '../../../shared/ui'
import { formatCRC } from '../../../shared/utils/pricing'
import { useAuth } from '../../auth/state'
import { formatAdminDate } from './admin-utils'
import './admin-pages.css'

interface OrderRow { readonly order: Pedido; readonly payment?: Pago; readonly user?: Usuario }

export function AdminOrdersPage() {
  const { commerce, users } = useAppServices()
  const { authMode } = useAuth()
  const [rows, setRows] = useState<readonly OrderRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (authMode === 'api') return
    let active = true
    void users.list().then(async (directory) => {
      const results = await Promise.all(directory.map(async (user) => {
        const [orders, payments] = await Promise.all([commerce.listOrdersByUser(user.id), commerce.listPaymentsByUser(user.id)])
        const paymentsById = new Map(payments.map((payment) => [payment.id, payment]))
        return orders.map((order) => ({ order, payment: paymentsById.get(order.pagoId), user }))
      }))
      if (active) setRows(results.flat().sort((left, right) => right.order.fechaPedido.localeCompare(left.order.fechaPedido)))
    }).catch(() => active && setError('No se pudo cargar el libro de pedidos.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [authMode, commerce, users])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    if (!normalized) return rows
    return rows.filter(({ order, payment, user }) => `${order.id} ${payment?.referenciaExterna ?? ''} ${user?.nombre ?? ''} ${user?.apellidos ?? ''}`.toLocaleLowerCase('es').includes(normalized))
  }, [query, rows])
  const total = rows.reduce((sum, { order }) => sum + order.total, 0)
  const discounts = rows.reduce((sum, { order }) => sum + order.descuento, 0)

  if (authMode === 'api') {
    return (
      <section className="admin-page">
        <header className="admin-page__header">
          <div>
            <h1 className="dashboard-page-title">Supervisión de Pedidos</h1>
          </div>
        </header>
        <Alert title="Pedidos no disponibles en la API" variant="info">
          Esta pantalla muestra únicamente pedidos y pagos demostrativos. El
          backend aún no ofrece endpoints para consultar órdenes o pagos.
        </Alert>
      </section>
    )
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header"><div><h1 aria-label="Pedidos" className="dashboard-page-title">Supervisión de Pedidos Confirmados</h1><p>Auditoría centralizada de transacciones completadas y órdenes generadas.</p></div></header>
      <Alert title="Datos demostrativos — backend pendiente">
        Esta vista usa pedidos y pagos locales de demostración. La API aún no
        ofrece endpoints de pedidos ni pagos.
      </Alert>
      <div className="admin-kpis"><KpiCard label="Confirmados" value={rows.length} /><KpiCard label="Facturado bruto" value={formatCRC(total)} /><KpiCard label="Volumen PYME" tone="success" value={rows.filter(({ order }) => order.descuento > 0).length} /><KpiCard label="Ahorro PYME" value={formatCRC(discounts)} /></div>
      <div className="admin-toolbar"><TextField label="Buscar pedido" onChange={(event) => setQuery(event.target.value)} placeholder="Orden, comprador o referencia" type="search" value={query} /><span>{filtered.length} registros visibles</span></div>
      {loading && <Skeleton height="24rem" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Identificador</th><th>Fecha</th><th>Comprador</th><th>Referencia de pago</th><th>Importe total</th></tr></thead><tbody>
        {filtered.map(({ order, payment, user }) => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{formatAdminDate(order.fechaPedido)}</td><td><strong>{user ? `${user.nombre} ${user.apellidos}` : 'Comprador'}</strong><small>{order.descuento > 0 ? 'PYME acreditada' : 'Comprador estándar'}</small></td><td>{payment?.referenciaExterna ?? order.pagoId}<small>{payment?.proveedor}</small></td><td><strong>{formatCRC(order.total)}</strong>{order.descuento > 0 && <small className="admin-pyme-label">Ahorro: {formatCRC(order.descuento)}</small>}</td></tr>)}
      </tbody></table></div>}
    </section>
  )
}
