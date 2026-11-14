import type { Colaborador, EntityId, IsoDateTime } from './common'

export type EstadoSolicitudPyme = 'pendiente' | 'aprobada' | 'rechazada'
export type EstadoAcreditacionPyme = 'activa' | 'vencida' | 'revocada'

interface SolicitudPymeBase {
  readonly id: EntityId
  readonly usuarioId: EntityId
  readonly nombreComercial: string
  readonly identificacionNegocio: string
  readonly actividadEconomica: string
  readonly documentos: readonly string[]
  readonly fechaSolicitud: IsoDateTime
}

export interface SolicitudPymePendiente extends SolicitudPymeBase {
  readonly estado: 'pendiente'
  readonly revisadoPor?: never
  readonly fechaRevision?: never
  readonly motivoRechazo?: never
}

export interface SolicitudPymeAprobada extends SolicitudPymeBase {
  readonly estado: 'aprobada'
  readonly revisadoPor: Colaborador
  readonly fechaRevision: IsoDateTime
  readonly motivoRechazo?: never
}

export interface SolicitudPymeRechazada extends SolicitudPymeBase {
  readonly estado: 'rechazada'
  readonly revisadoPor: Colaborador
  readonly fechaRevision: IsoDateTime
  readonly motivoRechazo: string
}

export type SolicitudPyme =
  | SolicitudPymePendiente
  | SolicitudPymeAprobada
  | SolicitudPymeRechazada

export interface AcreditacionPyme {
  readonly id: EntityId
  readonly usuarioId: EntityId
  readonly solicitudPyme: SolicitudPymeAprobada
  readonly fechaInicio: IsoDateTime
  readonly fechaVencimiento: IsoDateTime
  readonly estado: EstadoAcreditacionPyme
}
