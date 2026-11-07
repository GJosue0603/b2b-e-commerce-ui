import { Link } from 'react-router-dom'
import { routePatterns } from '../../../app/router/paths'
import { formatCRC } from '../../../shared/utils/pricing'

export interface SummaryCardProps {
  readonly itemCount: number
  readonly regularSubtotal: number
  readonly savings: number
  readonly total: number
}

export function SummaryCard({
  itemCount,
  regularSubtotal,
  savings,
  total,
}: SummaryCardProps) {
  return (
    <aside aria-labelledby="cart-summary-title" className="summary-card">
      <h2 id="cart-summary-title">Resumen del carrito</h2>
      <dl>
        <div>
          <dt>Subtotal regular ({itemCount})</dt>
          <dd>{formatCRC(regularSubtotal)}</dd>
        </div>
        {savings > 0 && (
          <div className="summary-card__savings">
            <dt>Ahorro PYME</dt>
            <dd>−{formatCRC(savings)}</dd>
          </div>
        )}
        <div className="summary-card__total">
          <dt>Total</dt>
          <dd>{formatCRC(total)}</dd>
        </div>
      </dl>
      <Link className="summary-card__checkout" to={routePatterns.checkout}>
        Continuar al pago
      </Link>
      <small>El pago y su autorización serán simulados en esta demo.</small>
    </aside>
  )
}
