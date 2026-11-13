export const catalogQueryKeys = {
  availability: 'disponibilidad',
  category: 'categoria',
  maximumPrice: 'precioMax',
  minimumPrice: 'precioMin',
  page: 'pagina',
  query: 'q',
  sort: 'orden',
} as const

export type CatalogAvailability = 'all' | 'in-stock' | 'out-of-stock'
export type CatalogSort =
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'

export interface CatalogQuery {
  readonly availability: CatalogAvailability
  readonly categoryId: string
  readonly maximumPrice?: number
  readonly minimumPrice?: number
  readonly page: number
  readonly query: string
  readonly sort: CatalogSort
}

export type CatalogQueryPatch = Partial<
  Omit<CatalogQuery, 'maximumPrice' | 'minimumPrice' | 'page'>
> & {
  readonly maximumPrice?: number | null
  readonly minimumPrice?: number | null
  readonly page?: number
}

const availabilityValues: readonly CatalogAvailability[] = [
  'all',
  'in-stock',
  'out-of-stock',
]

const sortValues: readonly CatalogSort[] = [
  'name-asc',
  'name-desc',
  'price-asc',
  'price-desc',
]

function parseNonNegativeNumber(value: string | null): number | undefined {
  if (!value?.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function parsePositiveInteger(value: string | null): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export function parseCatalogQuery(search: URLSearchParams): CatalogQuery {
  const availability = search.get(catalogQueryKeys.availability)
  const sort = search.get(catalogQueryKeys.sort)

  return {
    availability: availabilityValues.includes(
      availability as CatalogAvailability,
    )
      ? (availability as CatalogAvailability)
      : 'all',
    categoryId: search.get(catalogQueryKeys.category)?.trim() ?? '',
    maximumPrice: parseNonNegativeNumber(
      search.get(catalogQueryKeys.maximumPrice),
    ),
    minimumPrice: parseNonNegativeNumber(
      search.get(catalogQueryKeys.minimumPrice),
    ),
    page: parsePositiveInteger(search.get(catalogQueryKeys.page)),
    query: search.get(catalogQueryKeys.query)?.trim() ?? '',
    sort: sortValues.includes(sort as CatalogSort)
      ? (sort as CatalogSort)
      : 'name-asc',
  }
}

function setOptional(
  search: URLSearchParams,
  key: string,
  value: null | number | string | undefined,
) {
  if (value === null || value === undefined || value === '' || value === 'all') {
    search.delete(key)
  } else {
    search.set(key, String(value))
  }
}

export function patchCatalogQuery(
  current: URLSearchParams,
  patch: CatalogQueryPatch,
  resetPage = true,
): URLSearchParams {
  const next = new URLSearchParams(current)

  if (patch.query !== undefined) {
    setOptional(next, catalogQueryKeys.query, patch.query.trim())
  }
  if (patch.categoryId !== undefined) {
    setOptional(next, catalogQueryKeys.category, patch.categoryId)
  }
  if (patch.minimumPrice !== undefined) {
    setOptional(next, catalogQueryKeys.minimumPrice, patch.minimumPrice)
  }
  if (patch.maximumPrice !== undefined) {
    setOptional(next, catalogQueryKeys.maximumPrice, patch.maximumPrice)
  }
  if (patch.availability !== undefined) {
    setOptional(next, catalogQueryKeys.availability, patch.availability)
  }
  if (patch.sort !== undefined) {
    setOptional(
      next,
      catalogQueryKeys.sort,
      patch.sort === 'name-asc' ? undefined : patch.sort,
    )
  }

  if (patch.page !== undefined) {
    setOptional(
      next,
      catalogQueryKeys.page,
      patch.page <= 1 ? undefined : patch.page,
    )
  } else if (resetPage) {
    next.delete(catalogQueryKeys.page)
  }

  return next
}

export function clearCatalogFilters(
  current: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(current)
  Object.values(catalogQueryKeys).forEach((key) => next.delete(key))
  return next
}
