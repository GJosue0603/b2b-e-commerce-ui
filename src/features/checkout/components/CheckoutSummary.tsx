import { Link } from 'react-router-dom'
import type { CartTotals } from '../../../domain'
import { formatCRC } from '../../../shared/utils/pricing'

export interface CheckoutSummaryProps {
  readonly canContinue: boolean
  readonly paymentPath: string
  readonly totals: CartTotals
}

export function CheckoutSummary({
  canContinue,
  paymentPath,
  totals,
}: CheckoutSummaryProps) {
  return (
    <aside aria-labelledby="checkout-summary-title" className="checkout-summary">
      <div>
        <h2 id="checkout-summary-title">Resumen de la compra</h2>
        <span>Montos demostrativos en colones</span>
      </div>
      <dl>
        <div>
          <dt>Subtotal regular ({totals.itemCount})</dt>
          <dd>{formatCRC(totals.regularSubtotal)}</dd>
        </div>
        {totals.savings > 0 && (
          <div className="checkout-summary__savings">
            <dt>Ahorro PYME</dt>
            <dd>−{formatCRC(totals.savings)}</dd>
          </div>
        )}
        <div className="checkout-summary__total">
          <dt>Total</dt>
          <dd>{formatCRC(totals.total)}</dd>
        </div>
      </dl>
      {canContinue ? (
        <Link className="checkout-summary__action" to={paymentPath}>
          Continuar al pago simulado
        </Link>
      ) : (
        <button className="checkout-summary__action" disabled type="button">
          Continuar al pago simulado
        </button>
      )}
      <small>
        La autorización será simulada. NexoTech no solicita tarjeta, CVV ni
        credenciales bancarias en esta demo.
      </small>
    </aside>
  )
}
