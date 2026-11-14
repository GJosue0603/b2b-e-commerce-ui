export interface ApiCollaborator {
  readonly id: string
  readonly nombre: string
  readonly rol: string
}

export interface ApiPage<TItem> {
  readonly cantidadTotalDeItems: number
  readonly items: readonly TItem[]
  readonly numeroDePagina: number
  readonly cantidadPorPagina: number
  readonly totalDePaginas: number
}

export interface ApiPageQuery {
  readonly activo?: boolean
  readonly numeroDePagina?: number
  readonly cantidadPorPagina?: number
}
