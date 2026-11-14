import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ApiCategory, ApiProduct } from './contracts/catalog'
import { ApiHttpError, ApiNetworkError } from './http-client'
import { createApiCatalogReader } from './catalog-reader'

const category: ApiCategory = {
  id: '65f000000000000000000001',
  nombre: 'Audio',
  descripcion: 'Productos de audio',
  activo: true,
  creadoPor: {
    id: '65f000000000000000000010',
    nombre: 'Admin',
    rol: 'ADMINISTRADOR',
  },
  fechaCreacion: '2026-10-01T10:00:00Z',
}

const product: ApiProduct = {
  id: '65f000000000000000000002',
  nombre: 'Audífonos',
  descripcion: 'Audífonos inalámbricos',
  categoria: category,
  precioRegular: 34900,
  precioPyme: 31500,
  existencias: 12,
  imagenUrl: '/images/audifonos.jpg',
  activo: true,
  creadoPor: category.creadoPor,
  fechaCreacion: '2026-10-02T10:00:00Z',
}

function pagedResponse<TItem>(items: readonly TItem[]): Response {
  return new Response(
    JSON.stringify({
      cantidadTotalDeItems: items.length,
      items,
      numeroDePagina: 1,
      cantidadPorPagina: 100,
      totalDePaginas: items.length === 0 ? 0 : 1,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('adaptador HTTP del catálogo', () => {
  it('obtiene productos activos, respeta categoria anidada y conserva los IDs reales', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(pagedResponse([product]))
    vi.stubGlobal('fetch', fetcher)

    const reader = createApiCatalogReader()
    const products = await reader.listProducts()

    expect(products).toHaveLength(1)
    expect(products[0]?.id).toBe(product.id)
    expect(products[0]?.categoriaId).toBe(category.id)
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      '/v1/productos?activo=true&numeroDePagina=1&cantidadPorPagina=100',
    )
  })

  it('lista todas las categorías activas y consulta el detalle por su ID real', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(pagedResponse([category]))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(category), {
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    vi.stubGlobal('fetch', fetcher)

    const reader = createApiCatalogReader()
    await expect(reader.listCategories()).resolves.toMatchObject([
      { id: category.id, nombre: category.nombre },
    ])
    await expect(reader.getCategoryById(category.id)).resolves.toMatchObject({
      id: category.id,
    })

    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      '/v1/categorias?activo=true&numeroDePagina=1&cantidadPorPagina=100',
      `/v1/categorias/${category.id}`,
    ])
  })

  it('traduce 404 a elemento inexistente y propaga fallos de red', async () => {
    const notFound = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify('Producto no encontrado.'), {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      }),
    )
    vi.stubGlobal('fetch', notFound)
    await expect(
      createApiCatalogReader().getProductById(product.id),
    ).resolves.toBeNull()

    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline')),
    )
    await expect(
      createApiCatalogReader().listProducts(),
    ).rejects.toBeInstanceOf(ApiNetworkError)
  })

  it('no convierte respuestas HTTP distintas de 404 en ausencia de producto', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify('No autorizado.'), {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        }),
      ),
    )

    await expect(
      createApiCatalogReader().getProductById(product.id),
    ).rejects.toBeInstanceOf(ApiHttpError)
  })
})
