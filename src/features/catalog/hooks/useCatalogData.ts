import { useEffect, useState } from 'react'
import type { Categoria, Producto } from '../../../domain'
import type { AsyncState } from '../../../services'
import { useAppServices } from '../../../app/services'

export interface CatalogData {
  readonly categories: readonly Categoria[]
  readonly products: readonly Producto[]
}

export function useCatalogData(): AsyncState<CatalogData> {
  const { catalog } = useAppServices()
  const [state, setState] = useState<AsyncState<CatalogData>>({
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
          data: {
            categories: categories.filter((category) => category.activo),
            products,
          },
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
