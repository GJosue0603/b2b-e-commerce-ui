import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type {
  AcreditacionPyme,
  Pago,
  Pedido,
} from '../../../domain'
import { calculateCartTotals } from '../../../domain'
import { routePatterns } from '../../../app/router/paths'
import { useAppServices } from '../../../app/services'
import { Alert, Skeleton } from '../../../shared/ui'
import { formatCRC } from '../../../shared/utils/pricing'
import type { MockPaymentOutcome } from '../../../services'
import { useAuth } from '../../auth/state'
import { useCartProducts } from '../../cart/hooks/useCartProducts'
import { useCart } from '../../cart/state'
import { createMockOrderFromApprovedPayment } from '../usecases'
import './payment-result-page.css'

type PaymentResultState =
  | { readonly status: 'verifying'; readonly payment?: Pago }
  | { readonly status: 'approved'; readonly order: Pedido; readonly payment: Pago }
  | { readonly status: 'rejected' | 'cancelled'; readonly payment: Pago }
  | { readonly status: 'error'; readonly message: string }

export interface PaymentResultPageProps {
  readonly accreditation?: AcreditacionPyme | null
}

export function PaymentResultPage({ accreditation }: PaymentResultPageProps) {
  const { orders, paymentGateway } = useAppServices()
  const { user } = useAuth()
  const cart = useCart()
  const productsState = useCartProducts()
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<PaymentResultState>({
    status: 'verifying',
  })
  const settledRef = useRef(false)
  const outcome: MockPaymentOutcome = import.meta.env.DEV
    ? parseOutcome(searchParams.get('resultado'))
    : 'aprobado'
  const products = useMemo(
    () => (productsState.status === 'success' ? productsState.data : []),
    [productsState],
  )

  useEffect(() => {
    if (settledRef.current) return
    if (
      !user ||
      cart.status !== 'success' ||
      productsState.status !== 'success'
    ) {
      return
    }
    if (cart.items.length === 0) {
      return
    }

    let active = true
    const productById = new Map(products.map((product) => [product.id, product]))
    const lines = cart.items.flatMap((item) => {
      const product = productById.get(item.productoId)
      return product ? [{ product, quantity: item.cantidad }] : []
    })
    const totals = calculateCartTotals(lines, accreditation)
    const attemptKey = [
      user.id,
      outcome,
      totals.total,
      ...cart.items.map((item) => `${item.productoId}:${item.cantidad}`),
    ].join('|')

    void paymentGateway
      .startPayment({
        amount: totals.total,
        attemptKey,
        userId: user.id,
      })
      .then(async ({ payment }) => {
        if (!active) return
        setState({ status: 'verifying', payment })
        const resolved = await paymentGateway.resolvePayment(payment.id, outcome)
        if (!active) return
        if (resolved.payment.estado !== 'aprobado') {
          settledRef.current = true
          setState({
            status:
              resolved.payment.estado === 'rechazado'
                ? 'rejected'
                : 'cancelled',
            payment: resolved.payment,
          })
          return
        }

        const result = await createMockOrderFromApprovedPayment({
          accreditation,
          cartItems: cart.items,
          orders,
          payment: resolved.payment,
          products,
        })
        if (!active || result.order === null) return
        settledRef.current = true
        cart.clear()
        setState({
          status: 'approved',
          order: result.order,
          payment: resolved.payment,
        })
      })
      .catch((reason: unknown) => {
        if (!active) return
        setState({
          status: 'error',
          message:
            reason instanceof Error
              ? reason.message
              : 'No fue posible completar la simulación.',
        })
      })

    return () => {
      active = false
    }
  }, [
    accreditation,
    cart,
    orders,
    outcome,
    paymentGateway,
    products,
    productsState.status,
    user,
  ])

  if (cart.status === 'error' || productsState.status === 'error') {
    return <PaymentError message="No pudimos preparar la simulación de pago." />
  }
  if (
    cart.status === 'loading' ||
    productsState.status === 'loading' ||
    state.status === 'verifying'
  ) {
    if (cart.status === 'success' && cart.items.length === 0) {
      return (
        <PaymentError message="El carrito está vacío; no se inició ninguna transacción." />
      )
    }
    return <VerifyingPayment payment={state.status === 'verifying' ? state.payment : undefined} />
  }
  if (state.status === 'error') return <PaymentError message={state.message} />

  return <ResolvedPayment state={state} />
}

function parseOutcome(value: string | null): MockPaymentOutcome {
  return value === 'rechazado' || value === 'cancelado' ? value : 'aprobado'
}

function VerifyingPayment({ payment }: { readonly payment?: Pago }) {
  return (
    <main className="container payment-result-page">
      <section aria-live="polite" className="payment-result-card">
        <span className="payment-result-card__icon">…</span>
        <span className="payment-result-card__eyebrow">Simulación local</span>
        <h1>Verificando transacción simulada</h1>
        <p>No se está procesando dinero ni contactando una entidad financiera.</p>
        {payment && <small>Referencia mock: {payment.referenciaExterna}</small>}
        <Skeleton height="0.75rem" />
      </section>
    </main>
  )
}

function ResolvedPayment({
  state,
}: {
  readonly state: Exclude<PaymentResultState, { status: 'error' | 'verifying' }>
}) {
  const isApproved = state.status === 'approved'
  const copy = isApproved
    ? {
        eyebrow: 'Resultado mock: aprobado',
        title: 'Compra demostrativa confirmada',
        description: 'El pedido demo fue creado a partir de la aprobación simulada.',
        icon: '✓',
      }
    : state.status === 'rejected'
      ? {
          eyebrow: 'Resultado mock: rechazado',
          title: 'La transacción simulada fue rechazada',
          description: 'No se creó ningún pedido y tu carrito permanece disponible.',
          icon: '!',
        }
      : {
          eyebrow: 'Resultado mock: cancelado',
          title: 'Cancelaste la simulación',
          description: 'No se creó ningún pedido y tu carrito permanece disponible.',
          icon: '×',
        }

  return (
    <main className="container payment-result-page">
      <section
        className={`payment-result-card payment-result-card--${state.status}`}
      >
        <span className="payment-result-card__icon" aria-hidden="true">
          {copy.icon}
        </span>
        <span className="payment-result-card__eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <dl className="payment-result-details">
          <div><dt>Referencia simulada</dt><dd>{state.payment.referenciaExterna}</dd></div>
          <div><dt>Monto</dt><dd>{formatCRC(state.payment.monto)}</dd></div>
          {isApproved && (
            <div><dt>ID de pedido demo</dt><dd>{state.order.id}</dd></div>
          )}
        </dl>
        <div className="payment-result-actions">
          {isApproved ? (
            <>
              <Link to={routePatterns.orders}>Ver mis pedidos</Link>
              <Link className="payment-result-actions__secondary" to={routePatterns.catalog}>
                Seguir comprando
              </Link>
            </>
          ) : (
            <>
              <Link to={routePatterns.checkout}>Reintentar</Link>
              <Link className="payment-result-actions__secondary" to={routePatterns.cart}>
                Volver al carrito
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function PaymentError({ message }: { readonly message: string }) {
  return (
    <main className="container payment-result-page">
      <Alert title="No se inició el pago simulado" variant="warning">
        {message}
      </Alert>
      <Link className="payment-result-page__back" to={routePatterns.cart}>
        Volver al carrito
      </Link>
    </main>
  )
}
