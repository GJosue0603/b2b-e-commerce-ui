import { apiClient, ApiResponseError } from '../../http-client'
import type { ApiClient, ApiRequestOptions } from '../../http-client'
import type { ApiCart, ApiCartItemRequest } from './contracts'

function isApiCart(value: unknown): value is ApiCart {
  if (typeof value !== 'object' || value === null || !('items' in value)) {
    return false
  }
  const cart = value as Record<string, unknown>
  return (
    Array.isArray(cart.items) &&
    typeof cart.total === 'number' &&
    Number.isFinite(cart.total) &&
    cart.items.every((item: unknown) => {
      if (typeof item !== 'object' || item === null) return false
      const line = item as Record<string, unknown>
      return (
        typeof line.productoId === 'string' &&
        typeof line.nombreProducto === 'string' &&
        typeof line.precioUnitario === 'number' &&
        Number.isFinite(line.precioUnitario) &&
        typeof line.cantidad === 'number' &&
        Number.isInteger(line.cantidad) &&
        typeof line.subtotal === 'number' &&
        Number.isFinite(line.subtotal) &&
        typeof line.disponible === 'boolean'
      )
    })
  )
}

async function requireCart(
  response: ApiCart | undefined,
  operation: string,
): Promise<ApiCart> {
  if (!isApiCart(response)) {
    throw new ApiResponseError(
      `La API devolvió un carrito inválido al ${operation}.`,
    )
  }
  return response
}

export function createCartApi(client: ApiClient = apiClient) {
  return {
    async getCart(options?: ApiRequestOptions): Promise<ApiCart> {
      return requireCart(
        await client.get<ApiCart>('carrito', options),
        'consultar',
      )
    },

    async setItemQuantity(
      productId: string,
      desiredQuantity: number,
      options?: ApiRequestOptions,
    ): Promise<ApiCart> {
      const body: ApiCartItemRequest = { cantidad: desiredQuantity }
      return requireCart(
        await client.put<ApiCart, ApiCartItemRequest>(
          `carrito/items/${encodeURIComponent(productId)}`,
          body,
          options,
        ),
        'actualizar el carrito',
      )
    },

    async removeItem(
      productId: string,
      options?: ApiRequestOptions,
    ): Promise<ApiCart> {
      return requireCart(
        await client.delete<ApiCart>(
          `carrito/items/${encodeURIComponent(productId)}`,
          options,
        ),
        'eliminar el producto del carrito',
      )
    },

    async clearCart(options?: ApiRequestOptions): Promise<void> {
      await client.delete<void>('carrito', options)
    },
  }
}

export const cartApi = createCartApi()
