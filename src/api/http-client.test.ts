import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiAbortError,
  ApiClient,
  ApiHttpError,
  ApiNetworkError,
  ApiResponseError,
} from './http-client'

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ApiClient', () => {
  it('usa la base URL, serializa JSON y permite adjuntar un bearer opcional', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ id: 1 }))
    const client = new ApiClient({
      baseUrl: '/v1/',
      fetcher,
      getAccessToken: () => 'token-de-prueba',
    })

    await expect(
      client.post<{ id: number }, { name: string }>(
        '/productos',
        { name: 'Teclado' },
      ),
    ).resolves.toEqual({ id: 1 })

    const [url, init] = fetcher.mock.calls[0]!
    const headers = new Headers(init?.headers)
    expect(url).toBe('/v1/productos')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe('{"name":"Teclado"}')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Authorization')).toBe('Bearer token-de-prueba')
  })

  it('lee strings JSON y respuestas 204 sin contenido', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse('categoría creada'))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    const client = new ApiClient({ fetcher })

    await expect(client.get<string>('categorias')).resolves.toBe(
      'categoría creada',
    )
    await expect(client.delete<void>('carrito')).resolves.toBeUndefined()
  })

  it('soporta PUT, PATCH y DELETE con cuerpos JSON', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
    const client = new ApiClient({ fetcher })

    await client.put('categorias/123', { nombre: 'Audio' })
    await client.patch('categorias/123', { descripcion: 'Accesorios' })
    await client.delete('recursos/123', { body: { motivo: 'inactivo' } })

    expect(fetcher.mock.calls.map(([, init]) => [init?.method, init?.body])).toEqual([
      ['PUT', '{"nombre":"Audio"}'],
      ['PATCH', '{"descripcion":"Accesorios"}'],
      ['DELETE', '{"motivo":"inactivo"}'],
    ])
  })

  it.each([400, 401, 403, 404, 409, 429, 500])(
    'expone el estado HTTP %s sin convertirlo en éxito',
    async (status) => {
      const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse('error del servidor', status),
      )
      const client = new ApiClient({ fetcher })

      await expect(client.get('productos')).rejects.toMatchObject({
        body: 'error del servidor',
        status,
      } satisfies Partial<ApiHttpError>)
    },
  )

  it('distingue fallos de red, JSON inválido y solicitudes canceladas', async () => {
    const networkClient = new ApiClient({
      fetcher: vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline')),
    })
    await expect(networkClient.get('productos')).rejects.toBeInstanceOf(
      ApiNetworkError,
    )

    const invalidJsonClient = new ApiClient({
      fetcher: vi.fn<typeof fetch>().mockResolvedValue(
        new Response('{invalid', {
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    })
    await expect(invalidJsonClient.get('productos')).rejects.toBeInstanceOf(
      ApiResponseError,
    )

    const abortClient = new ApiClient({
      fetcher: vi
        .fn<typeof fetch>()
        .mockRejectedValue(new DOMException('Aborted', 'AbortError')),
    })
    await expect(abortClient.get('productos')).rejects.toBeInstanceOf(
      ApiAbortError,
    )
  })
})
