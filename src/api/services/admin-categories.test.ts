import { describe, expect, it, vi } from 'vitest'
import type { ApiCategory } from '../contracts/catalog'
import { ApiClient, ApiHttpError } from '../http-client'
import { createAdminCategoriesService } from './admin-categories'

const category: ApiCategory = {
  id: '65f000000000000000000001',
  nombre: 'Audio',
  descripcion: 'Productos de audio',
  activo: true,
  creadoPor: {
    id: '65f000000000000000000010',
    nombre: 'Administradora',
    rol: 'ADMINISTRADOR',
  },
  fechaCreacion: '2026-10-01T10:00:00Z',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('servicio administrativo de categorías', () => {
  it('consulta páginas sin filtrar las categorías inactivas', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        cantidadTotalDeItems: 26,
        items: [category],
        numeroDePagina: 2,
        cantidadPorPagina: 25,
        totalDePaginas: 2,
      }),
    )
    const service = createAdminCategoriesService(new ApiClient({ fetcher }))

    const page = await service.listCategoriesPage({
      numeroDePagina: 2,
      cantidadPorPagina: 25,
    })

    expect(page.items[0]?.id).toBe(category.id)
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      '/v1/categorias?numeroDePagina=2&cantidadPorPagina=25',
    )
  })

  it('crea y actualiza enviando únicamente nombre y descripcion', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(category, 201))
      .mockResolvedValueOnce(jsonResponse(category))
    const service = createAdminCategoriesService(
      new ApiClient({
        fetcher,
        getAccessToken: () => 'admin-token',
      }),
    )
    const input = {
      activo: true,
      descripcion: 'Nueva descripción',
      nombre: 'Audio',
    }

    await service.createCategory(input)
    await service.updateCategory(category.id, input)

    expect(fetcher.mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      ['/v1/categorias', 'POST'],
      [`/v1/categorias/${category.id}`, 'PUT'],
    ])
    expect(JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body))).toEqual({
      nombre: 'Audio',
      descripcion: 'Nueva descripción',
    })
    expect(JSON.parse(String(fetcher.mock.calls[1]?.[1]?.body))).toEqual({
      nombre: 'Audio',
      descripcion: 'Nueva descripción',
    })
    expect(new Headers(fetcher.mock.calls[0]?.[1]?.headers).get('Authorization'))
      .toBe('Bearer admin-token')
  })

  it('usa DELETE para desactivar y deja que los errores HTTP se propaguen', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse('La categoría se desactivó correctamente.'))
      .mockResolvedValueOnce(jsonResponse('Sin permisos.', 403))
    const service = createAdminCategoriesService(new ApiClient({ fetcher }))

    await service.deactivateCategory(category.id)
    await expect(service.updateCategory(category.id, {
      activo: true,
      descripcion: category.descripcion,
      nombre: category.nombre,
    })).rejects.toBeInstanceOf(ApiHttpError)

    expect(fetcher.mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      [`/v1/categorias/${category.id}`, 'DELETE'],
      [`/v1/categorias/${category.id}`, 'PUT'],
    ])
  })
})
