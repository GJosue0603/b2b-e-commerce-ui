import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  calculateCartTotals,
  calculateUnitPrice,
  type AcreditacionPyme,
} from '../../../domain'
import { routePatterns } from '../../../app/router/paths'
import { Alert, EmptyState, Skeleton } from '../../../shared/ui'
import { formatCRC } from '../../../shared/utils/pricing'
import type { MockPaymentOutcome } from '../../../services'
import { useAuth } from '../../auth/state'
import { useCartProducts } from '../../cart/hooks/useCartProducts'
import { useCart } from '../../cart/state'
import {
  CheckoutSteps,
  CheckoutSummary,
  PaymentScenarioControl,
} from '../components'
import './checkout-page.css'

export interface CheckoutPageProps {
  readonly accreditation?: AcreditacionPyme | null
}

export function CheckoutPage({ accreditation }: CheckoutPageProps) {
  const [paymentOutcome, setPaymentOutcome] =
    useState<MockPaymentOutcome>('aprobado')
  const { user } = useAuth()
  const cart = useCart()
  const productsState = useCartProducts()

  if (cart.status === 'loading' || productsState.status === 'loading') {
    return <CheckoutLoading />
  }

  if (cart.status === 'error' || productsState.status === 'error') {
    return (
      <div className="container checkout-page">
        <Alert title="No pudimos preparar la revisión" variant="danger">
          Intenta nuevamente antes de continuar al pago simulado.
        </Alert>
      </div>
    )
  }

  if (cart.mode === 'api') {
    return (
      <div className="container checkout-page">
        <header className="checkout-page__header">
          <span>Checkout no conectado</span>
          <h1>Revisar y pagar</h1>
          <p>El carrito API está disponible, pero checkout y pagos todavía no.</p>
        </header>
        <Alert title="No se inició ninguna compra" variant="info">
          Este flujo sigue siendo demostrativo y no puede usar ni vaciar un
          carrito de la API. Vuelve al carrito para continuar cuando checkout
          esté integrado.
        </Alert>
        <Link to={routePatterns.cart}>Volver al carrito</Link>
      </div>
    )
  }

  const products = productsState.status === 'success' ? productsState.data : []
  const productById = new Map(products.map((product) => [product.id, product]))
  const lines = cart.items.flatMap((item) => {
    const product = productById.get(item.productoId)
    return product ? [{ item, product }] : []
  })
  const totals = calculateCartTotals(
    lines.map(({ item, product }) => ({ product, quantity: item.cantidad })),
    accreditation,
  )
  const canContinue = user?.rol === 'comprador' && lines.length > 0

  return (
    <div className="container checkout-page">
      <header className="checkout-page__header">
        <span>Proceso de compra demostrativo</span>
        <h1>Revisar y pagar</h1>
        <p>Confirma los artículos y montos antes de continuar.</p>
      </header>
      <CheckoutSteps />

      <div className="checkout-page__layout">
        <div className="checkout-page__content">
          {user ? (
            <section className="checkout-panel" aria-labelledby="buyer-title">
              <h2 id="buyer-title">Identidad del comprador</h2>
              <dl className="checkout-buyer">
                <div><dt>Nombre</dt><dd>{[user.nombre, user.apellidos].filter(Boolean).join(' ') || 'No disponible desde la API'}</dd></div>
                <div><dt>Correo</dt><dd>{user.correo}</dd></div>
                <div><dt>Teléfono</dt><dd>{user.telefono ?? 'No disponible desde la API'}</dd></div>
              </dl>
            </section>
          ) : (
            <Alert title="Debes iniciar sesión" variant="warning">
              Ingresa como Comprador antes de continuar.
            </Alert>
          )}

          {lines.length === 0 ? (
            <EmptyState
              action={<Link to={routePatterns.catalog}>Explorar productos</Link>}
              description="Agrega artículos al carrito antes de revisar la compra."
              icon="◇"
              title="No hay artículos para revisar"
            />
          ) : (
            <section className="checkout-panel" aria-labelledby="items-title">
              <h2 id="items-title">Artículos a comprar ({totals.itemCount})</h2>
              <ul className="checkout-items">
                {lines.map(({ item, product }) => {
                  const unitPrice = calculateUnitPrice(product, accreditation)
                  return (
                    <li key={product.id}>
                      <img alt="" src={product.imagenUrl} />
                      <div>
                        <strong>{product.nombre}</strong>
                        <span>Cantidad: {item.cantidad}</span>
                        <small>{formatCRC(unitPrice)} por unidad</small>
                      </div>
                      <strong>{formatCRC(unitPrice * item.cantidad)}</strong>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
          <Link className="checkout-page__back" to={routePatterns.cart}>
            ← Volver al carrito
          </Link>
        </div>

        <div className="checkout-page__summary-column">
          <CheckoutSummary
            canContinue={canContinue}
            paymentPath={`${routePatterns.paymentResult}?resultado=${paymentOutcome}`}
            totals={totals}
          />
          <PaymentScenarioControl
            onChange={setPaymentOutcome}
            value={paymentOutcome}
          />
        </div>
      </div>
    </div>
  )
}

function CheckoutLoading() {
  return (
    <div aria-label="Preparando revisión de compra" className="container checkout-page">
      <Skeleton height="8rem" />
      <div className="checkout-page__layout">
        <Skeleton height="24rem" />
        <Skeleton height="22rem" />
      </div>
    </div>
  )
}
