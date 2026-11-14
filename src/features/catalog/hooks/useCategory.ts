import { useEffect, useState } from 'react'
import type { Categoria } from '../../../domain'
import type { AsyncState } from '../../../services'
import { useCatalogReader } from './useCatalogReader'

export function useCategory(
  categoryId: string | undefined,
): AsyncState<Categoria | null> {
  const catalog = useCatalogReader()
  const [state, setState] = useState<AsyncState<Categoria | null>>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()

    if (!categoryId) {
      void Promise.resolve().then(() => {
        if (!controller.signal.aborted) {
          setState({ status: 'success', data: null })
        }
      })
      return () => controller.abort()
    }

    void catalog
      .getCategoryById(categoryId, { signal: controller.signal })
      .then((category) => setState({ status: 'success', data: category }))
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          error:
            reason instanceof Error
              ? reason
              : new Error('No fue posible cargar la categoría.'),
        })
      })

    return () => controller.abort()
  }, [catalog, categoryId])

  return state
}
