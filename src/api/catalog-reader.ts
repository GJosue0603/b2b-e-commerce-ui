import type { CatalogReader } from '../services'
import type { ApiPageQuery } from './contracts/common'
import { ApiHttpError } from './http-client'
import { mapApiCategory, mapApiProduct } from './mappers/catalog'
import { loadAllApiPages } from './pagination'
import { createCategoriesApi } from './services/categories'
import { createCatalogApi } from './services/catalog'

export function createApiCatalogReader(): CatalogReader {
  const catalogApi = createCatalogApi()
  const categoriesApi = createCategoriesApi()

  const loadCategories = (query: ApiPageQuery, signal?: AbortSignal) =>
    loadAllApiPages((numeroDePagina, cantidadPorPagina) =>
      categoriesApi.listCategories(
        { ...query, numeroDePagina, cantidadPorPagina },
        { signal },
      ),
    )

  const loadProducts = (query: ApiPageQuery, signal?: AbortSignal) =>
    loadAllApiPages((numeroDePagina, cantidadPorPagina) =>
      catalogApi.listProducts(
        { ...query, numeroDePagina, cantidadPorPagina },
        { signal },
      ),
    )

  return {
    async getCategoryById(id, options) {
      try {
        const category = await categoriesApi.getCategoryById(id, options)
        if (!category) return null
        const mapped = mapApiCategory(category)
        return mapped.activo ? mapped : null
      } catch (reason) {
        if (reason instanceof ApiHttpError && reason.status === 404) return null
        throw reason
      }
    },

    async getProductById(id, options) {
      try {
        const product = await catalogApi.getProductById(id, options)
        if (!product) return null
        const mapped = mapApiProduct(product)
        return mapped.activo && product.categoria?.activo ? mapped : null
      } catch (reason) {
        if (reason instanceof ApiHttpError && reason.status === 404) return null
        throw reason
      }
    },

    async listCategories(options) {
      const categories = await loadCategories(
        { activo: true },
        options?.signal,
      )
      return categories.map(mapApiCategory).filter((category) => category.activo)
    },

    async listProducts(options) {
      const products = await loadProducts({ activo: true }, options?.signal)
      return products
        .filter((product) => product.activo && product.categoria?.activo)
        .map(mapApiProduct)
    },
  }
}
