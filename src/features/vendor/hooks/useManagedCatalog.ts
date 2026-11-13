import { useCallback, useEffect, useState } from 'react'
import { useAppServices } from '../../../app/services'
import type { Categoria, Producto } from '../../../domain'

export function useManagedCatalog() {
  const { catalog } = useAppServices()
  const [products, setProducts] = useState<readonly Producto[]>([])
  const [categories, setCategories] = useState<readonly Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextProducts, nextCategories] = await Promise.all([
        catalog.listManagedProducts(),
        catalog.listManagedCategories(),
      ])
      setProducts(nextProducts)
      setCategories(nextCategories)
    } catch {
      setError('No se pudo cargar el catálogo demostrativo.')
    } finally {
      setLoading(false)
    }
  }, [catalog])

  useEffect(() => {
    let active = true
    void Promise.all([
      catalog.listManagedProducts(),
      catalog.listManagedCategories(),
    ])
      .then(([nextProducts, nextCategories]) => {
        if (!active) return
        setProducts(nextProducts)
        setCategories(nextCategories)
      })
      .catch(() => {
        if (active) setError('No se pudo cargar el catálogo demostrativo.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [catalog])

  return { categories, error, loading, products, reload }
}
