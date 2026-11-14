import { Link } from 'react-router-dom'
import { routePatterns } from '../../../app/router/paths'
import { formatCRC } from '../../../shared/utils/pricing'

export interface SummaryCardProps {
  readonly itemCount: number
  readonly mode: 'api' | 'demo'
  readonly regularSubtotal: number
  readonly savings: number
  readonly serverTotal?: number
  readonly total: number
}

export function SummaryCard({
  itemCount,
  mode,
  regularSubtotal,
  serverTotal,
  savings,
  total,
}: SummaryCardProps) {
  return (
    <aside aria-labelledby="cart-summary-title" className="summary-card">
      <h2 id="cart-summary-title">Resumen del carrito</h2>
      <dl>
        {mode === 'demo' ? (
          <div>
            <dt>Subtotal regular ({itemCount})</dt>
            <dd>{formatCRC(regularSubtotal)}</dd>
          </div>
        ) : (
          <div>
            <dt>Total informado por el servidor</dt>
            <dd>
              {serverTotal === undefined
                ? 'No disponible'
                : formatCRC(serverTotal)}
            </dd>
          </div>
        )}
        {mode === 'demo' && savings > 0 && (
          <div className="summary-card__savings">
            <dt>Ahorro PYME</dt>
            <dd>−{formatCRC(savings)}</dd>
          </div>
        )}
        {mode === 'demo' && (
          <div className="summary-card__total">
            <dt>Total</dt>
            <dd>{formatCRC(total)}</dd>
          </div>
        )}
      </dl>
      {mode === 'demo' ? (
        <>
          <Link className="summary-card__checkout" to={routePatterns.checkout}>
            Continuar al pago
          </Link>
          <small>El pago y su autorización serán simulados en esta demo.</small>
        </>
      ) : (
        <small>Checkout y pagos no están conectados a la API.</small>
      )}
    </aside>
  )
}
