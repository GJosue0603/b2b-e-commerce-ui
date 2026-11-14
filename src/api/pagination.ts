import type { ApiPage } from './contracts/common'
import { ApiResponseError } from './http-client'

export const API_MAX_PAGE_SIZE = 100

export class ApiPaginationError extends ApiResponseError {
  constructor(message: string) {
    super(message)
  }
}

export type ApiPageLoader<TItem> = (
  pageNumber: number,
  pageSize: number,
) => Promise<ApiPage<TItem> | undefined>

function validatePage<TItem>(
  page: ApiPage<TItem> | undefined,
  expectedPageNumber: number,
): asserts page is ApiPage<TItem> {
  if (!page) {
    throw new ApiPaginationError('La API no devolvió los datos de paginación.')
  }

  const { cantidadPorPagina, cantidadTotalDeItems, items, numeroDePagina, totalDePaginas } =
    page
  if (
    !Array.isArray(items) ||
    !Number.isInteger(cantidadPorPagina) ||
    cantidadPorPagina < 1 ||
    cantidadPorPagina > API_MAX_PAGE_SIZE ||
    !Number.isInteger(cantidadTotalDeItems) ||
    cantidadTotalDeItems < 0 ||
    !Number.isInteger(totalDePaginas) ||
    totalDePaginas < 0 ||
    numeroDePagina !== expectedPageNumber
  ) {
    throw new ApiPaginationError('La API devolvió metadatos de paginación inválidos.')
  }

  const expectedTotalPages = Math.ceil(
    cantidadTotalDeItems / cantidadPorPagina,
  )
  if (totalDePaginas !== expectedTotalPages || items.length > cantidadPorPagina) {
    throw new ApiPaginationError(
      'La API devolvió metadatos de paginación inconsistentes.',
    )
  }
}

export async function loadAllApiPages<TItem>(
  loadPage: ApiPageLoader<TItem>,
): Promise<readonly TItem[]> {
  const firstPage = await loadPage(1, API_MAX_PAGE_SIZE)
  validatePage(firstPage, 1)

  const result = [...firstPage.items]
  for (
    let pageNumber = 2;
    pageNumber <= firstPage.totalDePaginas;
    pageNumber += 1
  ) {
    const page = await loadPage(pageNumber, API_MAX_PAGE_SIZE)
    validatePage(page, pageNumber)

    if (
      page.cantidadPorPagina !== firstPage.cantidadPorPagina ||
      page.cantidadTotalDeItems !== firstPage.cantidadTotalDeItems ||
      page.totalDePaginas !== firstPage.totalDePaginas
    ) {
      throw new ApiPaginationError(
        'Los metadatos cambiaron mientras se cargaban las páginas.',
      )
    }

    result.push(...page.items)
  }

  if (result.length !== firstPage.cantidadTotalDeItems) {
    throw new ApiPaginationError(
      'La respuesta paginada está incompleta; no se usarán resultados parciales.',
    )
  }

  return result
}
