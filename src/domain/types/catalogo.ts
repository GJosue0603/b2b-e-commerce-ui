import type {
  Colaborador,
  EntityId,
  IsoDateTime,
  MontoColones,
} from './common'

export interface Categoria {
  readonly id: EntityId
  readonly nombre: string
  readonly descripcion: string
  readonly activo: boolean
  readonly creadoPor?: Colaborador
  readonly fechaCreacion: IsoDateTime
  readonly modificadoPor?: Colaborador
  readonly fechaModificacion?: IsoDateTime
}

export interface Producto {
  readonly id: EntityId
  readonly nombre: string
  readonly descripcion: string
  readonly categoriaId: EntityId
  readonly precioRegular: MontoColones
  readonly precioPyme: MontoColones
  readonly existencias: number
  readonly imagenUrl: string
  readonly activo: boolean
  readonly creadoPor?: Colaborador
  readonly fechaCreacion: IsoDateTime
  readonly modificadoPor?: Colaborador
  readonly fechaModificacion?: IsoDateTime
}

export type EstadoInventario = 'disponible' | 'bajo' | 'agotado'

export interface InventarioProducto {
  readonly productoId: EntityId
  readonly existencias: number
  readonly estado: EstadoInventario
  readonly umbralBajo: number
  readonly fechaActualizacion: IsoDateTime
}
