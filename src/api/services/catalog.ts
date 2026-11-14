import type { ApiPage, ApiPageQuery } from '../contracts/common'
import type { ApiProduct } from '../contracts/catalog'
import { apiClient, type ApiClient, type ApiRequestOptions } from '../http-client'
import { toPageQueryString } from './query'

export function createCatalogApi(client: ApiClient = apiClient) {
  return {
    getProductById(
      productId: string,
      options?: ApiRequestOptions,
    ): Promise<ApiProduct | undefined> {
      return client.get<ApiProduct>(
        `productos/${encodeURIComponent(productId)}`,
        options,
      )
    },

    listProducts(
      query: ApiPageQuery = {},
      options?: ApiRequestOptions,
    ): Promise<ApiPage<ApiProduct> | undefined> {
      return client.get<ApiPage<ApiProduct>>(
        `productos${toPageQueryString(query)}`,
        options,
      )
    },
  }
}
