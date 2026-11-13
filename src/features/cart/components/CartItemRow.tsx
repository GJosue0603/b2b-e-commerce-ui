import { useState } from 'react'
import {
  calculateUnitPrice,
  type AcreditacionPyme,
  type ItemCarrito,
  type Producto,
} from '../../../domain'
import { formatCRC } from '../../../shared/utils/pricing'
import type { CartMutationResult } from '../state'
import { QuantitySelector } from './QuantitySelector'

export interface CartItemRowProps {
  readonly accreditation?: AcreditacionPyme | null
  readonly item: ItemCarrito
  readonly onRemove: (productId: string) => void
  readonly onUpdateQuantity: (
    productId: string,
    quantity: number,
    stock: number,
  ) => CartMutationResult
  readonly product: Producto
}

export function CartItemRow({
  accreditation,
  item,
  onRemove,
  onUpdateQuantity,
  product,
}: CartItemRowProps) {
  const [imageUnavailable, setImageUnavailable] = useState(false)
  const unitPrice = calculateUnitPrice(product, accreditation)

  return (
    <article className="cart-item-row">
      <div className="cart-item-row__image">
        {!imageUnavailable && (
          <img
            alt=""
            onError={() => setImageUnavailable(true)}
            src={product.imagenUrl}
          />
        )}
        {imageUnavailable && <span aria-hidden="true">{product.nombre.slice(0, 1)}</span>}
      </div>
      <div className="cart-item-row__details">
        <h2>{product.nombre}</h2>
        <span>{formatCRC(unitPrice)} por unidad</span>
        <button
          className="cart-item-row__remove"
          onClick={() => onRemove(product.id)}
          type="button"
        >
          Eliminar
        </button>
      </div>
      <QuantitySelector
        label={`Cantidad de ${product.nombre}`}
        max={product.existencias}
        onChange={(quantity) =>
          onUpdateQuantity(product.id, quantity, product.existencias)
        }
        value={item.cantidad}
      />
      <div className="cart-item-row__subtotal">
        <span>Subtotal</span>
        <strong>{formatCRC(unitPrice * item.cantidad)}</strong>
      </div>
    </article>
  )
}
