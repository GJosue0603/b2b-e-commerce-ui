import { describe, expect, it } from 'vitest'
import type { AcreditacionPyme } from '../../domain'
import { createMockServices } from '../../mocks/repositories'
import { filterCatalogProducts } from './catalog-filtering'
import type { CatalogQuery } from './catalog-query'

const baseFilters: CatalogQuery = {
  availability: 'all',
  categoryId: '',
  page: 1,
  query: '',
  sort: 'name-asc',
}

describe('filtrado del catálogo', () => {
  it('combina búsqueda, categoría, precio y disponibilidad', async () => {
    const services = createMockServices({ latencyMs: 0 })
    const [products, categories] = await Promise.all([
      services.catalog.listProducts(),
      services.catalog.listCategories(),
    ])
    const monitors = categories.find((category) => category.nombre === 'Monitores')
    if (!monitors) throw new Error('No se encontró la categoría Monitores.')

    const result = filterCatalogProducts(products, {
      ...baseFilters,
      availability: 'out-of-stock',
      categoryId: monitors.id,
      maximumPrice: 120_000,
      minimumPrice: 100_000,
      query: 'alta resolución',
    })

    expect(result.totalItems).toBe(1)
    expect(result.items[0]?.nombre).toBe('Monitor de 27 pulgadas')
  })

  it('filtra por el precio PYME solo cuando la acreditación está vigente', async () => {
    const services = createMockServices({ latencyMs: 0 })
    const [products, activeSession] = await Promise.all([
      services.catalog.listProducts(),
      services.demoSession.getByScenario('buyer-pyme-active'),
    ])
    const filters: CatalogQuery = {
      ...baseFilters,
      maximumPrice: 40_000,
      minimumPrice: 38_000,
      query: 'teclado',
    }
    const referenceDate = new Date('2026-11-07T12:00:00.000-06:00')

    expect(
      filterCatalogProducts(products, filters, null, referenceDate).totalItems,
    ).toBe(0)
    expect(
      filterCatalogProducts(
        products,
        filters,
        activeSession.accreditation as AcreditacionPyme,
        referenceDate,
      ).totalItems,
    ).toBe(1)
  })

  it('ordena y pagina sin mutar los productos originales', async () => {
    const services = createMockServices({ latencyMs: 0 })
    const products = await services.catalog.listProducts()
    const originalOrder = products.map((product) => product.id)
    const result = filterCatalogProducts(products, {
      ...baseFilters,
      page: 2,
      sort: 'price-desc',
    })

    expect(result.totalItems).toBe(5)
    expect(result.totalPages).toBe(2)
    expect(result.currentPage).toBe(2)
    expect(result.items).toHaveLength(1)
    expect(products.map((product) => product.id)).toEqual(originalOrder)
  })
})
