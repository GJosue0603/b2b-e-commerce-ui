import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { setApiAccessToken, clearApiAccessToken } from '../../../api/access-token-store'
import type { ApiCart } from '../../../api/services/cart/contracts'
import type { AuthContextValue } from '../../auth/state'
import { AuthContext } from '../../auth/state/auth-context'
import { CartProvider } from './CartProvider'
import { useCart } from './useCart'

const productId = '65f012345678901234567890'
const initialCart: ApiCart = {
  items: [
    {
      cantidad: 2,
      disponible: true,
      nombreProducto: 'Teclado',
      precioUnitario: 100,
      productoId: productId,
      subtotal: 200,
    },
  ],
  total: 200,
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

function createAuthContext(
  userId: string | null,
  authMode: 'api' | 'demo',
): AuthContextValue {
  const user = userId
    ? {
        activo: true,
        correo: 'buyer@example.test',
        id: userId,
        rol: 'comprador' as const,
      }
    : null
  return {
    actionStatus: 'idle',
    authMode,
    register: async () => ({ message: '', ok: true }),
    resendVerificationCode: async () => ({ message: '', ok: true }),
    signIn: async () => ({ message: '', ok: true }),
    signOut: vi.fn(async () => undefined),
    status: 'ready',
    updateProfile: async () => ({ message: '', ok: true }),
    user,
    verifyEmail: async () => ({ message: '', ok: true }),
  }
}

function CartProbe() {
  const cart = useCart()
  const [result, setResult] = useState('')

  const report = async (
    operation: Promise<{ readonly message: string; readonly ok: boolean }>,
  ) => {
    const response = await operation
    setResult(`${response.ok ? 'ok' : 'error'}:${response.message}`)
  }

  return (
    <>
      <span data-testid="cart-status">{cart.status}</span>
      <span data-testid="cart-count">{cart.itemCount}</span>
      <span data-testid="cart-total">{cart.serverCart?.total ?? 'none'}</span>
      <span data-testid="cart-pending">{String(cart.mutationPending)}</span>
      <span data-testid="cart-error">{cart.errorMessage ?? ''}</span>
      <button onClick={() => void report(cart.addItem(productId, 3, 10))}>
        Agregar tres
      </button>
      <button onClick={() => void report(cart.updateQuantity(productId, 4, 10))}>
        Fijar cuatro
      </button>
      <button onClick={() => void report(cart.removeItem(productId))}>
        Eliminar item
      </button>
      <button onClick={() => void report(cart.clear())}>Vaciar todo</button>
      <output>{result}</output>
    </>
  )
}

interface ProviderOptions {
  readonly authMode?: 'api' | 'demo'
  readonly catalogMode?: 'api' | 'demo'
  readonly userId?: string | null
  readonly responses?: Response[]
}

function renderApiCart({
  authMode = 'api',
  catalogMode = 'api',
  userId = 'user-api-1',
  responses = [jsonResponse(initialCart)],
}: ProviderOptions = {}) {
  setApiAccessToken('cart-bearer', Date.now() + 60_000)

  const requests: {
    readonly input: RequestInfo | URL
    readonly init?: RequestInit
  }[] = []
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ input, init })
    const response = responses.shift()
    if (!response) throw new Error('Falta una respuesta HTTP para la solicitud.')
    return response
  })

  const authContext = createAuthContext(userId, authMode)
  render(
    <AuthContext.Provider value={authContext}>
      <CartProvider catalogMode={catalogMode} mode="api">
        <CartProbe />
      </CartProvider>
    </AuthContext.Provider>,
  )
  return { authContext, requests }
}

afterEach(() => {
  clearApiAccessToken()
  vi.unstubAllGlobals()
})

describe('carrito API', () => {
  it('carga del servidor y suma las unidades existentes al PUT', async () => {
    const updatedCart: ApiCart = {
      items: [{ ...initialCart.items[0]!, cantidad: 5, subtotal: 500 }],
      total: 500,
    }
    const { requests } = renderApiCart({
      responses: [jsonResponse(initialCart), jsonResponse(updatedCart)],
    })
    const user = userEvent.setup()

    expect(await screen.findByTestId('cart-total')).toHaveTextContent('200')
    await user.click(screen.getByRole('button', { name: 'Agregar tres' }))

    expect(await screen.findByText('ok:Producto agregado al carrito.')).toBeVisible()
    expect(requests[1]?.input).toBe(`/v1/carrito/items/${productId}`)
    expect(requests[1]?.init?.body).toBe(JSON.stringify({ cantidad: 5 }))
    expect(requests[1]?.init?.method).toBe('PUT')
    expect(new Headers(requests[1]?.init?.headers).get('Authorization')).toBe(
      'Bearer cart-bearer',
    )
    expect(screen.getByTestId('cart-count')).toHaveTextContent('5')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('500')
  })

  it('manda la cantidad solicitada como total, no como incremento', async () => {
    const updatedCart: ApiCart = {
      items: [{ ...initialCart.items[0]!, cantidad: 4, subtotal: 400 }],
      total: 400,
    }
    const { requests } = renderApiCart({
      responses: [jsonResponse(initialCart), jsonResponse(updatedCart)],
    })
    const user = userEvent.setup()

    await screen.findByTestId('cart-total')
    await user.click(screen.getByRole('button', { name: 'Fijar cuatro' }))

    expect(await screen.findByText('ok:Cantidad actualizada.')).toBeVisible()
    expect(requests[1]?.init?.body).toBe(JSON.stringify({ cantidad: 4 }))
    expect(screen.getByTestId('cart-count')).toHaveTextContent('4')
  })

  it('actualiza el estado usando la respuesta del DELETE item', async () => {
    const emptyCart: ApiCart = { items: [], total: 0 }
    const { requests } = renderApiCart({
      responses: [jsonResponse(initialCart), jsonResponse(emptyCart)],
    })
    const user = userEvent.setup()

    await screen.findByTestId('cart-total')
    await user.click(screen.getByRole('button', { name: 'Eliminar item' }))

    expect(await screen.findByText('ok:Producto eliminado del carrito.')).toBeVisible()
    expect(requests[1]?.input).toBe(`/v1/carrito/items/${productId}`)
    expect(requests[1]?.init?.method).toBe('DELETE')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0')
  })

  it('vacía el estado local solo después de recibir 204', async () => {
    const { requests } = renderApiCart({
      responses: [jsonResponse(initialCart), new Response(null, { status: 204 })],
    })
    const user = userEvent.setup()

    await screen.findByTestId('cart-total')
    await user.click(screen.getByRole('button', { name: 'Vaciar todo' }))

    expect(await screen.findByText('ok:Carrito vaciado.')).toBeVisible()
    expect(requests[1]?.input).toBe('/v1/carrito')
    expect(requests[1]?.init?.method).toBe('DELETE')
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0')
  })

  it('no llama a la API sin usuario autenticado ni crea carrito visitante', async () => {
    const { requests } = renderApiCart({
      userId: null,
      responses: [],
    })

    expect(await screen.findByTestId('cart-status')).toHaveTextContent(
      'unauthenticated',
    )
    expect(requests).toHaveLength(0)
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
  })

  it('bloquea modo API cuando el catálogo es demo', async () => {
    const { requests } = renderApiCart({ catalogMode: 'demo' })

    expect(await screen.findByTestId('cart-status')).toHaveTextContent('error')
    expect(screen.getByText(/VITE_CATALOG_DATA_MODE=api/)).toBeVisible()
    expect(requests).toHaveLength(0)
  })

  it('bloquea modo API cuando la autenticación sigue siendo demo', async () => {
    const { requests } = renderApiCart({ authMode: 'demo' })

    expect(await screen.findByTestId('cart-status')).toHaveTextContent('error')
    expect(screen.getByTestId('cart-error')).toHaveTextContent(
      'VITE_AUTH_MODE=api',
    )
    expect(requests).toHaveLength(0)
  })

  it('conserva el carrito del servidor y muestra el conflicto de stock', async () => {
    renderApiCart({
      responses: [
        jsonResponse(initialCart),
        jsonResponse('Solo hay 3 unidades disponibles.', 409),
      ],
    })
    const user = userEvent.setup()

    await screen.findByTestId('cart-total')
    await user.click(screen.getByRole('button', { name: 'Agregar tres' }))

    expect(
      await screen.findByText(
        'error:Solo hay 3 unidades disponibles.',
      ),
    ).toBeVisible()
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('200')
  })

  it('convierte 401 en logout local después del rechazo del servidor', async () => {
    const { authContext } = renderApiCart({
      responses: [jsonResponse('Sesión expirada.', 401)],
    })

    expect(await screen.findByTestId('cart-status')).toHaveTextContent('error')
    expect(authContext.signOut).toHaveBeenCalledOnce()
    expect(screen.getByTestId('cart-error')).toHaveTextContent(/Tu sesión expiró/)
  })
})
