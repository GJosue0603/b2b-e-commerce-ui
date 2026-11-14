import { useState } from 'react'
import {
  calculateUnitPrice,
  type AcreditacionPyme,
  type ItemCarrito,
  type Producto,
} from '../../../domain'
import type { ApiCartItem } from '../../../api/services/cart/contracts'
import { Alert } from '../../../shared/ui'
import { formatCRC } from '../../../shared/utils/pricing'
import type { CartMutationResult } from '../state'
import { QuantitySelector } from './QuantitySelector'

export interface CartItemRowProps {
  readonly accreditation?: AcreditacionPyme | null
  readonly item: ItemCarrito
  readonly onRemove: (productId: string) => Promise<CartMutationResult>
  readonly onUpdateQuantity: (
    productId: string,
    quantity: number,
    stock: number,
  ) => Promise<CartMutationResult>
  readonly pending?: boolean
  readonly product?: Producto
  readonly serverItem?: ApiCartItem
}

export function CartItemRow({
  accreditation,
  item,
  onRemove,
  onUpdateQuantity,
  pending = false,
  product,
  serverItem,
}: CartItemRowProps) {
  const [imageUnavailable, setImageUnavailable] = useState(false)
  const [mutationError, setMutationError] = useState<string>()
  const productName = serverItem?.nombreProducto ?? product?.nombre ?? 'Producto'
  const unitPrice = serverItem?.precioUnitario ??
    (product ? calculateUnitPrice(product, accreditation) : undefined)
  const subtotal =
    serverItem?.subtotal ??
    (unitPrice === undefined ? undefined : unitPrice * item.cantidad)
  const maximumQuantity = product?.existencias ?? item.cantidad

  const handleUpdateQuantity = async (quantity: number) => {
    setMutationError(undefined)
    const result = await onUpdateQuantity(
      item.productoId,
      quantity,
      product?.existencias ?? 0,
    )
    if (!result.ok) setMutationError(result.message)
  }

  const handleRemove = async () => {
    setMutationError(undefined)
    const result = await onRemove(item.productoId)
    if (!result.ok) setMutationError(result.message)
  }

  return (
    <article className="cart-item-row">
      <div className="cart-item-row__image">
        {!imageUnavailable && product?.imagenUrl && (
          <img
            alt=""
            onError={() => setImageUnavailable(true)}
            src={product.imagenUrl}
          />
        )}
        {(imageUnavailable || !product?.imagenUrl) && (
          <span aria-hidden="true">{productName.slice(0, 1)}</span>
        )}
      </div>
      <div className="cart-item-row__details">
        <h2>{productName}</h2>
        <span>
          {unitPrice === undefined
            ? 'Precio no disponible'
            : `${formatCRC(unitPrice)} por unidad`}
        </span>
        {serverItem?.disponible === false && (
          <small role="status">
            Producto no disponible o existencias insuficientes. Ajusta la
            cantidad si hay stock o elimina el producto.
          </small>
        )}
        <button
          className="cart-item-row__remove"
          disabled={pending}
          onClick={() => void handleRemove()}
          type="button"
        >
          {pending ? 'Actualizando…' : 'Eliminar'}
        </button>
      </div>
      <QuantitySelector
        disabled={pending || !product || maximumQuantity < 1}
        label="Cantidad"
        accessibleLabel={`Cantidad de ${productName}`}
        max={maximumQuantity}
        onChange={(quantity) => void handleUpdateQuantity(quantity)}
        value={item.cantidad}
      />
      <div className="cart-item-row__subtotal">
        <span>Subtotal</span>
        <strong>{subtotal === undefined ? 'No disponible' : formatCRC(subtotal)}</strong>
      </div>
      {mutationError && (
        <Alert title="No se pudo actualizar el carrito" variant="danger">
          {mutationError}
        </Alert>
      )}
    </article>
  )
}
