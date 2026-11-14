import type { EntityId, IsoDateTime } from './common'

export type RolUsuario = 'comprador' | 'vendedor' | 'administrador'

export interface Usuario {
  readonly id: EntityId
  readonly nombre: string
  readonly apellidos: string
  readonly correo: string
  readonly telefono: string
  readonly rol: RolUsuario
  readonly activo: boolean
  readonly fechaCreacion: IsoDateTime
}
