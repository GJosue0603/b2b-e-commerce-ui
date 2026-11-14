import type { ApiPage, ApiPageQuery } from '../contracts/common'
import type { ApiCategory, ApiCategoryInput } from '../contracts/catalog'
import { apiClient, type ApiClient, type ApiRequestOptions } from '../http-client'
import { toPageQueryString } from './query'

export function createCategoriesApi(client: ApiClient = apiClient) {
  return {
    createCategory(
      input: ApiCategoryInput,
      options?: ApiRequestOptions,
    ): Promise<ApiCategory | undefined> {
      return client.post<ApiCategory, ApiCategoryInput>(
        'categorias',
        input,
        options,
      )
    },

    deactivateCategory(
      categoryId: string,
      options?: ApiRequestOptions,
    ): Promise<string | undefined> {
      return client.delete<string>(
        `categorias/${encodeURIComponent(categoryId)}`,
        options,
      )
    },

    getCategoryById(
      categoryId: string,
      options?: ApiRequestOptions,
    ): Promise<ApiCategory | undefined> {
      return client.get<ApiCategory>(
        `categorias/${encodeURIComponent(categoryId)}`,
        options,
      )
    },

    listCategories(
      query: ApiPageQuery = {},
      options?: ApiRequestOptions,
    ): Promise<ApiPage<ApiCategory> | undefined> {
      return client.get<ApiPage<ApiCategory>>(
        `categorias${toPageQueryString(query)}`,
        options,
      )
    },

    updateCategory(
      categoryId: string,
      input: ApiCategoryInput,
      options?: ApiRequestOptions,
    ): Promise<ApiCategory | undefined> {
      return client.put<ApiCategory, ApiCategoryInput>(
        `categorias/${encodeURIComponent(categoryId)}`,
        input,
        options,
      )
    },
  }
}
