import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AcreditacionPyme, Producto } from '../../../domain'
import { Button } from '../../../shared/ui'
import { PriceDisplay } from './PriceDisplay'
import { StockBadge } from './StockBadge'
import './catalog-components.css'

export interface ProductCardImage {
  readonly alt: string
  readonly src: string
}

export type ProductCardCta =
  | {
      readonly kind: 'detail'
      readonly label: string
      readonly to: string
    }
  | {
      readonly disabled?: boolean
      readonly kind: 'add-to-cart'
      readonly label: string
      readonly loading?: boolean
      readonly onClick: () => void
    }

export interface ProductCardProps {
  readonly accreditation?: AcreditacionPyme | null
  readonly categoryName?: string
  readonly cta: ProductCardCta
  readonly detailPath?: string
  readonly image: ProductCardImage
  readonly pricingReferenceDate?: Date
  readonly product: Producto
}

export function ProductCard({
  accreditation,
  categoryName,
  cta,
  detailPath,
  image,
  pricingReferenceDate,
  product,
}: ProductCardProps) {
  const [imageUnavailable, setImageUnavailable] = useState(false)
  const available = product.existencias > 0

  return (
    <article className="product-card">
      <div className="product-card__media">
        {!imageUnavailable && (
          <img
            alt={image.alt}
            onError={() => setImageUnavailable(true)}
            src={image.src}
          />
        )}
        {imageUnavailable && (
          <span aria-hidden="true" className="product-card__fallback">
            {product.nombre.slice(0, 1)}
          </span>
        )}
        <StockBadge quantity={product.existencias} />
      </div>
      <div className="product-card__body">
        {categoryName && <span>{categoryName}</span>}
        <h3>
          {detailPath ? <Link to={detailPath}>{product.nombre}</Link> : product.nombre}
        </h3>
        <p>{product.descripcion}</p>
        <PriceDisplay
          accreditation={accreditation}
          pymePrice={product.precioPyme}
          referenceDate={pricingReferenceDate}
          regularPrice={product.precioRegular}
        />
        {cta.kind === 'detail' ? (
          <Link className="product-card__cta" to={cta.to}>
            {cta.label}
          </Link>
        ) : (
          <Button
            className="product-card__cta"
            disabled={!available || cta.disabled}
            fullWidth
            loading={cta.loading}
            onClick={cta.onClick}
          >
            {cta.label}
          </Button>
        )}
      </div>
    </article>
  )
}
