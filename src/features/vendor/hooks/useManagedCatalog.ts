import { useCallback, useEffect, useState } from 'react'
import { useAppServices } from '../../../app/services'
import type { Categoria, Producto } from '../../../domain'
import {
  resolveCatalogDataMode,
  useCatalogReader,
} from '../../catalog/hooks/useCatalogReader'

function getCatalogErrorMessage(reason: unknown, apiMode: boolean) {
  if (reason instanceof Error) return reason.message
  return apiMode
    ? 'No se pudo cargar el catálogo de la API.'
    : 'No se pudo cargar el catálogo demostrativo.'
}

export function useManagedCatalog() {
  const { catalog } = useAppServices()
  const catalogReader = useCatalogReader()
  const apiMode = resolveCatalogDataMode() === 'api'
  const [products, setProducts] = useState<readonly Producto[]>([])
  const [categories, setCategories] = useState<readonly Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCatalog = useCallback(
    async (signal?: AbortSignal) => {
      const options = signal ? { signal } : undefined
      return apiMode
        ? Promise.all([
            catalogReader.listProducts(options),
            catalogReader.listCategories(options),
          ])
        : Promise.all([
            catalog.listManagedProducts(options),
            catalog.listManagedCategories(options),
          ])
    },
    [apiMode, catalog, catalogReader],
  )

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextProducts, nextCategories] = await fetchCatalog()
      setProducts(nextProducts)
      setCategories(nextCategories)
    } catch (reason) {
      setError(getCatalogErrorMessage(reason, apiMode))
    } finally {
      setLoading(false)
    }
  }, [apiMode, fetchCatalog])

  useEffect(() => {
    const controller = new AbortController()
    void fetchCatalog(controller.signal)
      .then(([nextProducts, nextCategories]) => {
        if (controller.signal.aborted) return
        setProducts(nextProducts)
        setCategories(nextCategories)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(getCatalogErrorMessage(reason, apiMode))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [apiMode, fetchCatalog])

  return { categories, error, loading, products, reload }
}
