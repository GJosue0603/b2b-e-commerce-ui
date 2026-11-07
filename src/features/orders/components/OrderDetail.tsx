import type { Pago, Pedido } from '../../../domain'
import { formatCRC } from '../../../shared/utils/pricing'

export interface OrderDetailProps {
  readonly order: Pedido
  readonly payment: Pago
}

export function OrderDetail({ order, payment }: OrderDetailProps) {
  return (
    <details className="order-card">
      <summary>
        <span>
          <strong>Pedido {order.id}</strong>
          <small>
            {new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium' }).format(
              new Date(order.fechaPedido),
            )}
          </small>
        </span>
        <strong>{formatCRC(order.total)}</strong>
      </summary>
      <div className="order-card__detail">
        <h2>Productos confirmados</h2>
        <ul className="order-card__items">
          {order.items.map((item) => (
            <li key={item.productoId}>
              <span>
                <strong>{item.nombreProducto}</strong>
                <small>
                  {item.cantidad} × {formatCRC(item.precioUnitario)}
                </small>
              </span>
              <strong>{formatCRC(item.subtotal)}</strong>
            </li>
          ))}
        </ul>
        <dl className="order-card__totals">
          <div>
            <dt>Subtotal regular</dt>
            <dd>{formatCRC(order.subtotal)}</dd>
          </div>
          {order.descuento > 0 && (
            <div className="order-card__discount">
              <dt>Ahorro PYME</dt>
              <dd>−{formatCRC(order.descuento)}</dd>
            </div>
          )}
          <div>
            <dt>Total confirmado</dt>
            <dd>{formatCRC(order.total)}</dd>
          </div>
        </dl>
        <div className="order-card__payment">
          <span>Pago simulado aprobado</span>
          <strong>{payment.referenciaExterna}</strong>
        </div>
      </div>
    </details>
  )
}
