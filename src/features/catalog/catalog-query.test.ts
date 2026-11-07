import { describe, expect, it } from 'vitest'
import {
  clearCatalogFilters,
  parseCatalogQuery,
  patchCatalogQuery,
} from './catalog-query'

describe('parámetros del catálogo', () => {
  it('interpreta valores válidos y normaliza los inválidos', () => {
    const parsed = parseCatalogQuery(
      new URLSearchParams(
        'q=monitor&categoria=pantallas&precioMin=10000&precioMax=200000&disponibilidad=in-stock&orden=price-desc&pagina=2',
      ),
    )

    expect(parsed).toEqual({
      availability: 'in-stock',
      categoryId: 'pantallas',
      maximumPrice: 200_000,
      minimumPrice: 10_000,
      page: 2,
      query: 'monitor',
      sort: 'price-desc',
    })

    expect(parseCatalogQuery(new URLSearchParams('pagina=-2&precioMin=-1'))).toEqual(
      expect.objectContaining({ minimumPrice: undefined, page: 1 }),
    )
  })

  it('mantiene parámetros existentes y reinicia página al filtrar', () => {
    const current = new URLSearchParams('q=teclado&pagina=3&origen=home')
    const next = patchCatalogQuery(current, {
      availability: 'in-stock',
      sort: 'price-asc',
    })

    expect(next.get('q')).toBe('teclado')
    expect(next.get('origen')).toBe('home')
    expect(next.get('disponibilidad')).toBe('in-stock')
    expect(next.get('orden')).toBe('price-asc')
    expect(next.has('pagina')).toBe(false)
  })

  it('limpia solo los parámetros propios del catálogo', () => {
    const cleared = clearCatalogFilters(
      new URLSearchParams('q=mouse&categoria=audio&pagina=2&origen=campana'),
    )

    expect(cleared.toString()).toBe('origen=campana')
  })
})
