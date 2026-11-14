import type { ApiPageQuery } from '../contracts/common'
import type { Categoria } from '../../domain'
import type { CategoryInput } from '../../services'
import { loadApiPage } from '../pagination'
import { mapApiCategory } from '../mappers/catalog'
import {
  apiClient,
  ApiResponseError,
  type ApiClient,
  type ApiRequestOptions,
} from '../http-client'
import { createCategoriesApi } from './categories'

function toApiCategoryInput(input: CategoryInput) {
  return {
    nombre: input.nombre,
    descripcion: input.descripcion,
  }
}

export function createAdminCategoriesService(client: ApiClient = apiClient) {
  const categoriesApi = createCategoriesApi(client)

  return {
    async createCategory(
      input: CategoryInput,
      options?: ApiRequestOptions,
    ): Promise<Categoria> {
      const category = await categoriesApi.createCategory(
        toApiCategoryInput(input),
        options,
      )
      if (!category) {
        throw new ApiResponseError('La API no devolvió la categoría creada.')
      }
      return mapApiCategory(category)
    },

    async deactivateCategory(
      categoryId: string,
      options?: ApiRequestOptions,
    ): Promise<void> {
      await categoriesApi.deactivateCategory(categoryId, options)
    },

    async listCategoriesPage(
      query: ApiPageQuery = {},
      options?: ApiRequestOptions,
    ) {
      const numeroDePagina = query.numeroDePagina ?? 1
      const cantidadPorPagina = query.cantidadPorPagina ?? 25
      const page = await loadApiPage(
        (pageNumber, pageSize) =>
          categoriesApi.listCategories(
            { ...query, numeroDePagina: pageNumber, cantidadPorPagina: pageSize },
            options,
          ),
        numeroDePagina,
        cantidadPorPagina,
      )
      return { ...page, items: page.items.map(mapApiCategory) }
    },

    async updateCategory(
      categoryId: string,
      input: CategoryInput,
      options?: ApiRequestOptions,
    ): Promise<Categoria> {
      const category = await categoriesApi.updateCategory(
        categoryId,
        toApiCategoryInput(input),
        options,
      )
      if (!category) {
        throw new ApiResponseError('La API no devolvió la categoría actualizada.')
      }
      return mapApiCategory(category)
    },
  }
}

export type AdminCategoriesService = ReturnType<
  typeof createAdminCategoriesService
>
