import type { Categoria, Producto } from '../../../domain'
import type { AsyncState } from '../../../services'
import { useCatalogData } from '../../catalog/hooks/useCatalogData'

const FEATURED_PRODUCT_LIMIT = 4

export interface HomeCatalogData {
  readonly categories: readonly Categoria[]
  readonly featuredProducts: readonly Producto[]
}

function selectHomeCatalog(
  categories: readonly Categoria[],
  products: readonly Producto[],
): HomeCatalogData {
  return {
    categories: categories.filter((category) => category.activo),
    featuredProducts: products
      .filter((product) => product.activo)
      .slice(0, FEATURED_PRODUCT_LIMIT),
  }
}

export function useHomeCatalog(): AsyncState<HomeCatalogData> {
  const catalogState = useCatalogData()
  if (catalogState.status !== 'success') return catalogState
  return {
    status: 'success',
    data: selectHomeCatalog(
      catalogState.data.categories,
      catalogState.data.products,
    ),
  }
}
