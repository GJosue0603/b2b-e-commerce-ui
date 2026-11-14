import { Link } from 'react-router-dom'
import { routePatterns } from '../../app/router/paths'
import { CartIcon } from './StoreIcons'

export interface CartLinkProps {
  readonly cartItemCount?: number
  readonly cartStatus?: 'loading' | 'success' | 'error' | 'unauthenticated'
}

export function CartLink({ cartItemCount = 0, cartStatus = 'success' }: CartLinkProps) {
  const label = cartStatus === 'loading'
    ? 'Carrito, cargando productos'
    : cartStatus === 'unauthenticated'
      ? 'Carrito, inicia sesión para consultar'
      : `Carrito, ${cartItemCount} ${cartItemCount === 1 ? 'producto' : 'productos'}`

  return (
    <Link aria-busy={cartStatus === 'loading' || undefined} aria-label={label}
      className="header-action header-action--cart"
      title={cartStatus === 'error' ? 'No se pudo consultar el carrito' : undefined}
      to={routePatterns.cart}>
      <CartIcon />
      <span aria-hidden="true" className="cart-count">
        {cartStatus === 'loading' ? '…' : cartStatus === 'unauthenticated' ? 0 : cartItemCount}
      </span>
    </Link>
  )
}
