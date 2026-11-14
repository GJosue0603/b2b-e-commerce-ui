import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  calculateCartTotals,
  type AcreditacionPyme,
} from '../../../domain'
import { routePatterns } from '../../../app/router/paths'
import { Alert, Button, EmptyState, Skeleton } from '../../../shared/ui'
import { CartItemRow, SummaryCard } from '../components'
import { useCartProducts } from '../hooks/useCartProducts'
import { useCart } from '../state'
import './cart-page.css'

export interface CartPageProps {
  readonly accreditation?: AcreditacionPyme | null
}

export function CartPage({ accreditation }: CartPageProps) {
  const cart = useCart()
  const productsState = useCartProducts()
  const [clearError, setClearError] = useState('')

  const handleClear = async () => {
    setClearError('')
    const result = await cart.clear()
    if (!result.ok) setClearError(result.message)
  }

  if (cart.status === 'unauthenticated') {
    return (
      <div className="container cart-page">
        <h1>Tu carrito</h1>
        <Alert title="Inicia sesión para consultar tu carrito" variant="info">
          El carrito API pertenece a una cuenta autenticada.{' '}
          <Link to={routePatterns.signIn}>Iniciar sesión</Link>
        </Alert>
      </div>
    )
  }

  if (cart.status === 'loading' || productsState.status === 'loading') {
    return <CartPageSkeleton />
  }

  if (cart.status === 'error' || productsState.status === 'error') {
    return (
      <div className="container cart-page">
        <h1>Tu carrito</h1>
        <Alert title="No pudimos cargar el carrito" variant="danger">
          {cart.errorMessage ??
            (productsState.status === 'error'
              ? productsState.error.message
              : 'Intenta nuevamente dentro de unos instantes.')}
        </Alert>
      </div>
    )
  }

  const products = productsState.status === 'success' ? productsState.data : []
  const productById = new Map(products.map((product) => [product.id, product]))
  const lines = cart.items.map((item) => ({
    item,
    product: productById.get(item.productoId),
    serverItem: cart.serverCart?.items.find(
      (serverItem) => serverItem.productoId === item.productoId,
    ),
  }))

  const totals = calculateCartTotals(
    lines.flatMap(({ item, product }) =>
      product ? [{ product, quantity: item.cantidad }] : [],
    ),
    accreditation,
  )

  return (
    <div className="container cart-page">
      <header className="cart-page__header">
        <div className="cart-page__heading">
          <span>
            {cart.mode === 'api' ? 'Carrito de la API' : 'Compra demostrativa'}
          </span>
          <h1>Tu carrito</h1>
        </div>
        <div className="cart-page__actions">
          {lines.length > 0 && (
            <Button
              disabled={cart.mutationPending}
              loading={cart.mutationPending}
              onClick={() => void handleClear()}
              size="sm"
              variant="ghost"
            >
              Vaciar carrito
            </Button>
          )}
          {lines.length > 0 && (
            <Link to={routePatterns.catalog}>Seguir comprando</Link>
          )}
        </div>
      </header>

      {clearError && (
        <Alert title="No se pudo vaciar el carrito" variant="danger">
          {clearError}
        </Alert>
      )}

      {lines.length === 0 ? (
        <EmptyState
          action={<Link to={routePatterns.catalog}>Explorar productos</Link>}
          description="Agrega productos desde el catálogo para preparar tu compra."
          icon="◇"
          title="Tu carrito está vacío"
        />
      ) : (
        <div className="cart-page__layout">
          <section aria-label="Productos en el carrito" className="cart-page__items">
            {lines.map(({ item, product, serverItem }) => (
              <CartItemRow
                accreditation={accreditation}
                item={item}
                key={item.productoId}
                onRemove={cart.removeItem}
                onUpdateQuantity={cart.updateQuantity}
                pending={cart.mutationPending}
                product={product}
                serverItem={serverItem}
              />
            ))}
          </section>
          <div className="cart-page__summary">
            <SummaryCard
              itemCount={cart.itemCount}
              mode={cart.mode}
              regularSubtotal={totals.regularSubtotal}
              serverTotal={cart.serverCart?.total}
              savings={totals.savings}
              total={totals.total}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function CartPageSkeleton() {
  return (
    <div aria-label="Cargando carrito" className="container cart-page">
      <Skeleton height="5rem" />
      <div className="cart-page__layout">
        <Skeleton height="18rem" />
        <Skeleton height="18rem" />
      </div>
    </div>
  )
}
