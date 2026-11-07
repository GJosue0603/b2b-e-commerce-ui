import { useEffect, useState } from 'react'
import type { Categoria, Producto } from '../../../domain'
import type { AsyncState } from '../../../services'
import { useAppServices } from '../../../app/services'

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
  const { catalog } = useAppServices()
  const [state, setState] = useState<AsyncState<HomeCatalogData>>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()

    void Promise.all([
      catalog.listCategories({ signal: controller.signal }),
      catalog.listProducts({ signal: controller.signal }),
    ])
      .then(([categories, products]) => {
        setState({
          status: 'success',
          data: selectHomeCatalog(categories, products),
        })
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          error:
            reason instanceof Error
              ? reason
              : new Error('No fue posible cargar el catálogo.'),
        })
      })

    return () => controller.abort()
  }, [catalog])

  return state
}
