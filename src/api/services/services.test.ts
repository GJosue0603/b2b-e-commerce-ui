import { describe, expect, it, vi } from 'vitest'
import { ApiClient } from '../http-client'
import {
  createCategoriesApi,
  createCatalogApi,
  createUsersApi,
} from './index'

describe('servicios HTTP disponibles en la API', () => {
  it('construye la ruta y los parámetros paginados de productos', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          cantidadTotalDeItems: 0,
          items: [],
          numeroDePagina: 2,
          cantidadPorPagina: 10,
          totalDePaginas: 0,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const catalog = createCatalogApi(
      new ApiClient({ baseUrl: '/v1', fetcher }),
    )

    await catalog.listProducts({
      activo: true,
      numeroDePagina: 2,
      cantidadPorPagina: 10,
    })

    expect(fetcher.mock.calls[0]?.[0]).toBe(
      '/v1/productos?activo=true&numeroDePagina=2&cantidadPorPagina=10',
    )
  })

  it('usa solo las rutas existentes para categorías y usuarios', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify('Categoría desactivada.'), {
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            cantidadTotalDeItems: 0,
            items: [],
            numeroDePagina: 1,
            cantidadPorPagina: 25,
            totalDePaginas: 0,
          }),
          { headers: { 'Content-Type': 'application/json' } },
        ),
      )
    const client = new ApiClient({ baseUrl: '/v1', fetcher })
    const categories = createCategoriesApi(client)
    const users = createUsersApi(client)

    await categories.deactivateCategory('abc123')
    await users.listUsers()

    expect(fetcher.mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      ['/v1/categorias/abc123', 'DELETE'],
      ['/v1/usuarios', 'GET'],
    ])
  })
})
