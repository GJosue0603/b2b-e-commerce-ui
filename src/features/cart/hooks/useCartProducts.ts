import { useEffect, useState } from 'react'
import type { Producto } from '../../../domain'
import type { AsyncState } from '../../../services'
import { useAppServices } from '../../../app/services'

export function useCartProducts(): AsyncState<readonly Producto[]> {
  const { catalog } = useAppServices()
  const [state, setState] = useState<AsyncState<readonly Producto[]>>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()
    void catalog
      .listProducts({ signal: controller.signal })
      .then((products) => setState({ status: 'success', data: products }))
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          error:
            reason instanceof Error
              ? reason
              : new Error('No fue posible cargar los productos del carrito.'),
        })
      })
    return () => controller.abort()
  }, [catalog])

  return state
}
