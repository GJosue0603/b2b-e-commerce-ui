import { useEffect, useState } from 'react'
import type { Producto } from '../../../domain'
import type { AsyncState } from '../../../services'
import { useCatalogReader } from './useCatalogReader'

export function useProduct(productId: string | undefined): AsyncState<Producto | null> {
  const catalog = useCatalogReader()
  const [state, setState] = useState<AsyncState<Producto | null>>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()

    if (!productId) {
      Promise.resolve().then(() => {
        if (!controller.signal.aborted) {
          setState({ status: 'success', data: null })
        }
      })
      return () => controller.abort()
    }

    void catalog
      .getProductById(productId, { signal: controller.signal })
      .then((product) => setState({ status: 'success', data: product }))
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          error:
            reason instanceof Error
              ? reason
              : new Error('No fue posible cargar el producto.'),
        })
      })

    return () => controller.abort()
  }, [catalog, productId])

  return state
}
