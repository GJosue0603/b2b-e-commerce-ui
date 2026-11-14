import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearApiAccessToken,
  getApiAccessToken,
  setApiAccessToken,
} from './access-token-store'
import { ApiClient } from './http-client'

describe('almacén en memoria del bearer', () => {
  afterEach(() => {
    clearApiAccessToken()
    vi.useRealTimers()
  })

  it('elimina el token al alcanzar su vencimiento', () => {
    vi.useFakeTimers()
    vi.setSystemTime(10_000)
    setApiAccessToken('token-no-persistente', 11_000)

    expect(getApiAccessToken()).toBe('token-no-persistente')
    vi.setSystemTime(11_000)
    expect(getApiAccessToken()).toBeNull()
  })

  it('permite borrar localmente la sesión', () => {
    setApiAccessToken('token-no-persistente', Date.now() + 60_000)

    clearApiAccessToken()

    expect(getApiAccessToken()).toBeNull()
  })

  it('adjunta el bearer en solicitudes del cliente centralizado', async () => {
    setApiAccessToken('memory-token', Date.now() + 60_000)
    let requestHeaders: Headers | undefined
    const fetcher: typeof fetch = async (_input, init) => {
      requestHeaders = new Headers(init?.headers)
      return new Response(null, { status: 204 })
    }
    const client = new ApiClient({
      baseUrl: '/v1',
      fetcher,
      getAccessToken: getApiAccessToken,
    })

    await client.get('productos')

    expect(requestHeaders?.get('Authorization')).toBe('Bearer memory-token')
  })
})
