import { describe, expect, it } from 'vitest'
import { ApiClient } from '../../http-client'
import { createCartApi } from './cart-api'

const apiCart = {
  items: [
    {
      cantidad: 2,
      disponible: true,
      nombreProducto: 'Teclado',
      precioUnitario: 100,
      productoId: '65f012345678901234567890',
      subtotal: 200,
    },
  ],
  total: 200,
}

function createTestApi(response: Response) {
  const calls: {
    readonly input: RequestInfo | URL
    readonly init?: RequestInit
  }[] = []
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ input, init })
    return response
  }
  return {
    api: createCartApi(
      new ApiClient({
        baseUrl: '/v1',
        fetcher,
        getAccessToken: () => 'cart-test-token',
      }),
    ),
    calls,
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

describe('servicio HTTP del carrito', () => {
  it('consulta GET /carrito con el bearer del cliente centralizado', async () => {
    const { api, calls } = createTestApi(jsonResponse(apiCart))

    await expect(api.getCart()).resolves.toEqual(apiCart)
    expect(calls[0]?.input).toBe('/v1/carrito')
    expect(new Headers(calls[0]?.init?.headers).get('Authorization')).toBe(
      'Bearer cart-test-token',
    )
  })

  it('envía PUT con la cantidad total deseada', async () => {
    const { api, calls } = createTestApi(jsonResponse(apiCart))

    await api.setItemQuantity('65f012345678901234567890', 5)

    expect(calls[0]?.input).toBe(
      '/v1/carrito/items/65f012345678901234567890',
    )
    expect(calls[0]?.init?.method).toBe('PUT')
    expect(calls[0]?.init?.body).toBe(JSON.stringify({ cantidad: 5 }))
  })

  it('elimina un item y devuelve el nuevo carrito del servidor', async () => {
    const emptyCart = { items: [], total: 0 }
    const { api, calls } = createTestApi(jsonResponse(emptyCart))

    await expect(api.removeItem('65f012345678901234567890')).resolves.toEqual(
      emptyCart,
    )
    expect(calls[0]?.init?.method).toBe('DELETE')
    expect(calls[0]?.input).toBe(
      '/v1/carrito/items/65f012345678901234567890',
    )
  })

  it('vacía el carrito aceptando la respuesta 204 sin contenido', async () => {
    const { api, calls } = createTestApi(new Response(null, { status: 204 }))

    await expect(api.clearCart()).resolves.toBeUndefined()
    expect(calls[0]?.init?.method).toBe('DELETE')
    expect(calls[0]?.input).toBe('/v1/carrito')
  })
})
