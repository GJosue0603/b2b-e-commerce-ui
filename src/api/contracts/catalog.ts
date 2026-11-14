import type { ApiCollaborator } from './common'

export interface ApiCategory {
  readonly id: string
  readonly nombre: string
  readonly descripcion: string
  readonly activo: boolean
  readonly creadoPor: ApiCollaborator | null
  readonly fechaCreacion: string
  readonly modificadoPor?: ApiCollaborator | null
  readonly fechaModificacion?: string | null
}

export interface ApiProduct {
  readonly id: string
  readonly nombre: string
  readonly descripcion: string
  readonly categoria: ApiCategory | null
  readonly precioRegular: number
  readonly precioPyme: number
  readonly existencias: number
  readonly imagenUrl: string
  readonly activo: boolean
  readonly creadoPor: ApiCollaborator | null
  readonly fechaCreacion: string
  readonly modificadoPor?: ApiCollaborator | null
  readonly fechaModificacion?: string | null
}

export interface ApiCategoryInput {
  readonly nombre: string
  readonly descripcion: string
}
