import type { ApiPageQuery } from '../contracts/common'

export function toPageQueryString(query: ApiPageQuery = {}): string {
  const search = new URLSearchParams()
  if (query.activo !== undefined) search.set('activo', String(query.activo))
  if (query.numeroDePagina !== undefined) {
    search.set('numeroDePagina', String(query.numeroDePagina))
  }
  if (query.cantidadPorPagina !== undefined) {
    search.set('cantidadPorPagina', String(query.cantidadPorPagina))
  }
  const value = search.toString()
  return value ? `?${value}` : ''
}
