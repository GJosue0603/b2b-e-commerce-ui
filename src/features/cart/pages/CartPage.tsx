import { Link } from 'react-router-dom'
import {
  calculateCartTotals,
  type AcreditacionPyme,
} from '../../../domain'
import { routePatterns } from '../../../app/router/paths'
import { Alert, EmptyState, Skeleton } from '../../../shared/ui'
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

  if (cart.status === 'loading' || productsState.status === 'loading') {
    return <CartPageSkeleton />
  }

  if (cart.status === 'error' || productsState.status === 'error') {
    return (
      <div className="container cart-page">
        <h1>Tu carrito</h1>
        <Alert title="No pudimos cargar el carrito" variant="danger">
          Intenta nuevamente dentro de unos instantes.
        </Alert>
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

  return (
    <div className="container cart-page">
      <header className="cart-page__header">
        <div>
          <span>Compra demostrativa</span>
          <h1>Tu carrito</h1>
        </div>
        {lines.length > 0 && <Link to={routePatterns.catalog}>Seguir comprando</Link>}
      </header>

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
            {lines.map(({ item, product }) => (
              <CartItemRow
                accreditation={accreditation}
                item={item}
                key={product.id}
                onRemove={cart.removeItem}
                onUpdateQuantity={cart.updateQuantity}
                product={product}
              />
            ))}
          </section>
          <div className="cart-page__summary">
            <SummaryCard
              itemCount={totals.itemCount}
              regularSubtotal={totals.regularSubtotal}
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
