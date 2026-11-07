export type EntityId = string
export type IsoDateTime = string

/** Monto demostrativo expresado en colones enteros, sin decimales. */
export type MontoColones = number

export interface Colaborador {
  readonly id: EntityId
  readonly nombre: string
}
