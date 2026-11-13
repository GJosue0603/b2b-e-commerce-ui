import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { AcreditacionPyme, Producto } from '../../../domain'
import { routePatterns } from '../../../app/router/paths'
import { Alert, Button, EmptyState, Skeleton } from '../../../shared/ui'
import { QuantitySelector } from '../../cart/components'
import type { CartMutationResult } from '../../cart/state'
import { PriceDisplay, ProductGallery, StockBadge } from '../components'
import { useCatalogData } from '../hooks/useCatalogData'
import { useProduct } from '../hooks/useProduct'
import './product-detail-page.css'

export interface ProductDetailPageProps {
  readonly accreditation?: AcreditacionPyme | null
  readonly onAddToCart?: (
    product: Producto,
    quantity: number,
  ) => CartMutationResult
}

export function ProductDetailPage({
  accreditation,
  onAddToCart,
}: ProductDetailPageProps) {
  const { productId } = useParams<{ productId: string }>()
  const [quantity, setQuantity] = useState(1)
  const [cartMessage, setCartMessage] = useState<CartMutationResult | null>(null)
  const productState = useProduct(productId)
  const catalogState = useCatalogData()

  if (productState.status === 'loading') return <ProductDetailSkeleton />
  if (productState.status === 'error') {
    return (
      <div className="container product-detail-page">
        <Alert title="No pudimos cargar el producto" variant="danger">
          Intenta nuevamente dentro de unos instantes.
        </Alert>
      </div>
    )
  }
  if (productState.status !== 'success' || !productState.data) {
    return (
      <div className="container product-detail-page">
        <EmptyState
          action={<Link to={routePatterns.catalog}>Volver al catálogo</Link>}
          description="El producto solicitado no existe o ya no está disponible."
          icon="◇"
          title="Producto no encontrado"
        />
      </div>
    )
  }

  const product = productState.data
  const category =
    catalogState.status === 'success'
      ? catalogState.data.categories.find(
          (item) => item.id === product.categoriaId,
        )
      : undefined

  return (
    <div className="container product-detail-page">
      <nav aria-label="Migas de pan" className="product-breadcrumb">
        <Link to={routePatterns.home}>Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link to={routePatterns.catalog}>Catálogo</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.nombre}</span>
      </nav>

      <div className="product-detail">
        <ProductGallery
          images={[{ alt: product.nombre, src: product.imagenUrl }]}
          productName={product.nombre}
        />

        <section className="product-detail__information">
          {category && <span className="product-detail__category">{category.nombre}</span>}
          <h1>{product.nombre}</h1>
          <StockBadge quantity={product.existencias} />
          <p>{product.descripcion}</p>
          <PriceDisplay
            accreditation={accreditation}
            pymePrice={product.precioPyme}
            regularPrice={product.precioRegular}
          />
          <dl className="product-detail__metadata">
            <div>
              <dt>Disponibilidad</dt>
              <dd>
                {product.existencias > 0
                  ? `${product.existencias} unidades`
                  : 'Sin existencias'}
              </dd>
            </div>
            <div>
              <dt>Categoría</dt>
              <dd>{category?.nombre ?? 'Sin categoría'}</dd>
            </div>
          </dl>
          <div className="product-detail__purchase">
            <QuantitySelector
              disabled={product.existencias < 1}
              max={product.existencias}
              onChange={setQuantity}
              value={quantity}
            />
            <Button
              disabled={product.existencias < 1 || !onAddToCart}
              fullWidth
              onClick={() => {
                if (onAddToCart) {
                  setCartMessage(onAddToCart(product, quantity))
                }
              }}
              size="lg"
            >
              Agregar al carrito
            </Button>
          </div>
          {cartMessage && (
            <Alert
              title={cartMessage.ok ? 'Carrito actualizado' : 'No se pudo agregar'}
              variant={cartMessage.ok ? 'success' : 'danger'}
            >
              {cartMessage.message}
            </Alert>
          )}
        </section>
      </div>
      <section className="product-assurances" aria-label="Beneficios del producto">
        <span><strong>Despacho 24h</strong><small>Entrega ágil en Costa Rica</small></span>
        <span><strong>Garantía local</strong><small>Respaldo directo NexoTech</small></span>
        <span><strong>Facturación DGT</strong><small>Comprobante electrónico</small></span>
      </section>
      <section className="product-specifications" aria-labelledby="specifications-title">
        <header>
          <div>
            <span>Especificaciones técnicas</span>
            <h2 id="specifications-title">Ficha Técnica Detallada</h2>
          </div>
          <small>Información del catálogo NexoTech</small>
        </header>
        <dl>
          <div><dt>Conectividad</dt><dd>Bluetooth y conexión USB</dd></div>
          <div><dt>Compatibilidad</dt><dd>Windows, macOS y dispositivos móviles</dd></div>
          <div><dt>Materiales</dt><dd>Construcción durable para uso profesional</dd></div>
          <div><dt>Garantía</dt><dd>12 meses con soporte técnico local</dd></div>
          <div><dt>Disponibilidad</dt><dd>{product.existencias} unidades en inventario</dd></div>
          <div><dt>Categoría</dt><dd>{category?.nombre ?? 'Tecnología'}</dd></div>
        </dl>
      </section>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div aria-label="Cargando detalle del producto" className="container product-detail-page">
      <div className="product-detail">
        <Skeleton height="30rem" />
        <Skeleton height="22rem" />
      </div>
    </div>
  )
}
