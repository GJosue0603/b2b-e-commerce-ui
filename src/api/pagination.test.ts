import { describe, expect, it, vi } from 'vitest'
import type { ApiPage } from './contracts/common'
import {
  API_MAX_PAGE_SIZE,
  ApiPaginationError,
  loadAllApiPages,
  loadApiPage,
} from './pagination'

function makePage<TItem>(
  pageNumber: number,
  items: readonly TItem[],
  totalItems: number,
): ApiPage<TItem> {
  return {
    cantidadTotalDeItems: totalItems,
    items,
    numeroDePagina: pageNumber,
    cantidadPorPagina: API_MAX_PAGE_SIZE,
    totalDePaginas: Math.ceil(totalItems / API_MAX_PAGE_SIZE),
  }
}

describe('paginación de catálogo API', () => {
  it('valida una página individual y respeta el máximo permitido', async () => {
    const loadPage = vi.fn().mockResolvedValue(makePage(2, [100], 101))

    const page = await loadApiPage(loadPage, 2, API_MAX_PAGE_SIZE)

    expect(page.items).toEqual([100])
    expect(loadPage).toHaveBeenCalledWith(2, API_MAX_PAGE_SIZE)
    await expect(loadApiPage(loadPage, 1, 101)).rejects.toBeInstanceOf(
      ApiPaginationError,
    )
  })

  it('carga el conjunto completo solicitando como máximo 100 elementos por página', async () => {
    const firstPageItems = Array.from({ length: 100 }, (_, index) => index)
    const loadPage = vi
      .fn()
      .mockResolvedValueOnce(makePage(1, firstPageItems, 101))
      .mockResolvedValueOnce(makePage(2, [100], 101))

    const items = await loadAllApiPages(loadPage)

    expect(items).toHaveLength(101)
    expect(loadPage.mock.calls).toEqual([
      [1, API_MAX_PAGE_SIZE],
      [2, API_MAX_PAGE_SIZE],
    ])
  })

  it('no devuelve resultados parciales si faltan elementos en páginas siguientes', async () => {
    const loadPage = vi
      .fn()
      .mockResolvedValueOnce(makePage(1, Array.from({ length: 100 }, (_, i) => i), 101))
      .mockResolvedValueOnce(makePage(2, [], 101))

    await expect(loadAllApiPages(loadPage)).rejects.toBeInstanceOf(
      ApiPaginationError,
    )
  })

  it('rechaza metadatos inconsistentes entre páginas', async () => {
    const loadPage = vi
      .fn()
      .mockResolvedValueOnce(makePage(1, Array.from({ length: 100 }, (_, i) => i), 101))
      .mockResolvedValueOnce({
        ...makePage(2, [100], 101),
        cantidadTotalDeItems: 102,
      })

    await expect(loadAllApiPages(loadPage)).rejects.toBeInstanceOf(
      ApiPaginationError,
    )
  })
})
