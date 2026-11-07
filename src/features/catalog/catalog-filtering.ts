import type { AcreditacionPyme, Producto } from '../../domain'
import { getProductPriceForCustomer } from '../../shared/utils/pricing'
import type { CatalogQuery } from './catalog-query'

export const CATALOG_PAGE_SIZE = 4

export interface CatalogResult {
  readonly currentPage: number
  readonly items: readonly Producto[]
  readonly totalItems: number
  readonly totalPages: number
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
}

export function filterCatalogProducts(
  products: readonly Producto[],
  filters: CatalogQuery,
  accreditation?: AcreditacionPyme | null,
  referenceDate?: Date,
): CatalogResult {
  const query = normalize(filters.query)
  const getPrice = (product: Producto) =>
    getProductPriceForCustomer(product, accreditation, referenceDate)

  const filtered = products.filter((product) => {
    if (!product.activo) return false
    if (
      query &&
      !normalize(`${product.nombre} ${product.descripcion}`).includes(query)
    ) {
      return false
    }
    if (filters.categoryId && product.categoriaId !== filters.categoryId) {
      return false
    }
    if (filters.availability === 'in-stock' && product.existencias <= 0) {
      return false
    }
    if (filters.availability === 'out-of-stock' && product.existencias > 0) {
      return false
    }

    const price = getPrice(product)
    if (filters.minimumPrice !== undefined && price < filters.minimumPrice) {
      return false
    }
    if (filters.maximumPrice !== undefined && price > filters.maximumPrice) {
      return false
    }
    return true
  })

  const sorted = [...filtered].sort((left, right) => {
    switch (filters.sort) {
      case 'name-desc':
        return right.nombre.localeCompare(left.nombre, 'es')
      case 'price-asc':
        return getPrice(left) - getPrice(right)
      case 'price-desc':
        return getPrice(right) - getPrice(left)
      case 'name-asc':
        return left.nombre.localeCompare(right.nombre, 'es')
    }
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / CATALOG_PAGE_SIZE))
  const currentPage = Math.min(filters.page, totalPages)
  const start = (currentPage - 1) * CATALOG_PAGE_SIZE

  return {
    currentPage,
    items: sorted.slice(start, start + CATALOG_PAGE_SIZE),
    totalItems: sorted.length,
    totalPages,
  }
}
