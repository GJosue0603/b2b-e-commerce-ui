import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Producto } from '../../../domain'
import { paths } from '../../../app/router/paths'
import { Badge } from '../../../shared/ui'
import { formatColones } from '../../../shared/utils/currency'

export interface ProductCardProps {
  readonly categoryName?: string
  readonly product: Producto
}

export function ProductCard({ categoryName, product }: ProductCardProps) {
  const [imageUnavailable, setImageUnavailable] = useState(false)
  const available = product.existencias > 0

  return (
    <article className="product-card">
      <div className="product-card__media">
        {!imageUnavailable && (
          <img
            alt=""
            onError={() => setImageUnavailable(true)}
            src={product.imagenUrl}
          />
        )}
        {imageUnavailable && (
          <span aria-hidden="true" className="product-card__fallback">
            {product.nombre.slice(0, 1)}
          </span>
        )}
        <Badge variant={available ? 'success' : 'danger'}>
          {available ? 'En stock' : 'Agotado'}
        </Badge>
      </div>
      <div className="product-card__body">
        {categoryName && <span>{categoryName}</span>}
        <h3>{product.nombre}</h3>
        <p>{product.descripcion}</p>
        <strong>{formatColones(product.precioRegular)}</strong>
        <Link to={paths.productDetail(product.id)}>Ver detalle</Link>
      </div>
    </article>
  )
}
