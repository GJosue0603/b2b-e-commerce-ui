import type { ApiPage, ApiPageQuery } from '../contracts/common'
import type { ApiUser } from '../contracts/users'
import { apiClient, type ApiClient, type ApiRequestOptions } from '../http-client'
import { toPageQueryString } from './query'

export function createUsersApi(client: ApiClient = apiClient) {
  return {
    getUserById(
      userId: string,
      options?: ApiRequestOptions,
    ): Promise<ApiUser | undefined> {
      return client.get<ApiUser>(
        `usuarios/${encodeURIComponent(userId)}`,
        options,
      )
    },

    listUsers(
      query: ApiPageQuery = {},
      options?: ApiRequestOptions,
    ): Promise<ApiPage<ApiUser> | undefined> {
      return client.get<ApiPage<ApiUser>>(
        `usuarios${toPageQueryString(query)}`,
        options,
      )
    },
  }
}
