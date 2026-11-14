import type { ApiPageQuery } from '../contracts/common'
import type { Usuario } from '../../domain'
import { loadApiPage } from '../pagination'
import { mapApiUser } from '../mappers/users'
import {
  apiClient,
  ApiResponseError,
  type ApiClient,
  type ApiRequestOptions,
} from '../http-client'
import { createUsersApi } from './users'

export function createAdminUsersService(client: ApiClient = apiClient) {
  const usersApi = createUsersApi(client)

  return {
    async getUserById(
      userId: string,
      options?: ApiRequestOptions,
    ): Promise<Usuario> {
      const user = await usersApi.getUserById(userId, options)
      if (!user) {
        throw new ApiResponseError('La API no devolvió el detalle del usuario.')
      }
      return mapApiUser(user)
    },

    async listUsersPage(
      query: ApiPageQuery = {},
      options?: ApiRequestOptions,
    ) {
      const numeroDePagina = query.numeroDePagina ?? 1
      const cantidadPorPagina = query.cantidadPorPagina ?? 25
      const page = await loadApiPage(
        (pageNumber, pageSize) =>
          usersApi.listUsers(
            { ...query, numeroDePagina: pageNumber, cantidadPorPagina: pageSize },
            options,
          ),
        numeroDePagina,
        cantidadPorPagina,
      )
      return { ...page, items: page.items.map(mapApiUser) }
    },
  }
}

export type AdminUsersService = ReturnType<typeof createAdminUsersService>
