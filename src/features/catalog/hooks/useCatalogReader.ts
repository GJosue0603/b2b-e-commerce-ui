import { useMemo } from 'react'
import { createApiCatalogReader } from '../../../api/catalog-reader'
import { useAppServices } from '../../../app/services'
import type { CatalogReader } from '../../../services'

export type CatalogDataMode = 'api' | 'demo'

export function resolveCatalogDataMode(
  value: string | undefined = import.meta.env.VITE_CATALOG_DATA_MODE,
): CatalogDataMode {
  if (value === undefined || value === '' || value === 'demo') return 'demo'
  if (value === 'api') return 'api'
  throw new Error(
    `VITE_CATALOG_DATA_MODE debe ser "demo" o "api"; se recibió "${value}".`,
  )
}

const apiCatalogReader = createApiCatalogReader()

export function useCatalogReader(): CatalogReader {
  const { catalog } = useAppServices()
  const mode = resolveCatalogDataMode()

  const demoCatalogReader = useMemo<CatalogReader>(
    () => ({
      ...catalog,
      getCategoryById: async (id, options) =>
        (await catalog.listCategories(options)).find(
          (category) => category.id === id,
        ) ?? null,
    }),
    [catalog],
  )

  return mode === 'api' ? apiCatalogReader : demoCatalogReader
}
