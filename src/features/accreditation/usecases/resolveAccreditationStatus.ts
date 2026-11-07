import {
  isAccreditationValid,
  type AcreditacionPyme,
  type SolicitudPyme,
} from '../../../domain'

export type AccreditationDisplayStatus =
  | 'active'
  | 'expired'
  | 'none'
  | 'pending'
  | 'rejected'
  | 'revoked'

export interface AccreditationStatusModel {
  readonly accreditation: AcreditacionPyme | null
  readonly benefitsEnabled: boolean
  readonly request: SolicitudPyme | null
  readonly status: AccreditationDisplayStatus
}

export function resolveAccreditationStatus(
  requests: readonly SolicitudPyme[],
  accreditations: readonly AcreditacionPyme[],
  referenceDate: Date = new Date(),
): AccreditationStatusModel {
  const request = [...requests].sort((left, right) =>
    right.fechaSolicitud.localeCompare(left.fechaSolicitud),
  )[0] ?? null
  const accreditation = [...accreditations].sort((left, right) =>
    right.fechaInicio.localeCompare(left.fechaInicio),
  )[0] ?? null
  const requestIsNewer =
    request !== null &&
    (accreditation === null ||
      request.fechaSolicitud > accreditation.solicitudPyme.fechaSolicitud)

  if (requestIsNewer && request.estado === 'pendiente') {
    return { accreditation, benefitsEnabled: false, request, status: 'pending' }
  }
  if (requestIsNewer && request.estado === 'rechazada') {
    return { accreditation, benefitsEnabled: false, request, status: 'rejected' }
  }
  if (accreditation?.estado === 'revocada') {
    return { accreditation, benefitsEnabled: false, request, status: 'revoked' }
  }
  if (
    accreditation?.estado === 'vencida' ||
    (accreditation?.estado === 'activa' &&
      !isAccreditationValid(accreditation, referenceDate))
  ) {
    return { accreditation, benefitsEnabled: false, request, status: 'expired' }
  }
  if (isAccreditationValid(accreditation, referenceDate)) {
    return { accreditation, benefitsEnabled: true, request, status: 'active' }
  }
  if (request?.estado === 'pendiente') {
    return { accreditation, benefitsEnabled: false, request, status: 'pending' }
  }
  if (request?.estado === 'rechazada') {
    return { accreditation, benefitsEnabled: false, request, status: 'rejected' }
  }
  return { accreditation, benefitsEnabled: false, request, status: 'none' }
}
