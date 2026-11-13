import type {
  AcreditacionPyme,
  SolicitudPyme,
  SolicitudPymeAprobada,
} from '../../domain'
import { fixtureIds } from './ids'
import { colaboradores } from './usuarios'

export const solicitudPymeActiva = {
  id: fixtureIds.requests.active,
  usuarioId: fixtureIds.users.buyerPymeActive,
  nombreComercial: 'Soluciones Delta Demo',
  identificacionNegocio: 'DEMO-NEG-001',
  actividadEconomica: 'Servicios tecnológicos',
  documentos: ['/fixtures/documentos/demo-delta-constancia.pdf'],
  estado: 'aprobada',
  fechaSolicitud: '2026-01-12T16:00:00.000Z',
  revisadoPor: colaboradores.administrador,
  fechaRevision: '2026-01-15T17:30:00.000Z',
} as const satisfies SolicitudPymeAprobada

export const solicitudPymeVencida = {
  id: fixtureIds.requests.expired,
  usuarioId: fixtureIds.users.buyerPymeExpired,
  nombreComercial: 'Comercial Elena Demo',
  identificacionNegocio: 'DEMO-NEG-002',
  actividadEconomica: 'Comercio minorista',
  documentos: ['/fixtures/documentos/demo-elena-respaldo.pdf'],
  estado: 'aprobada',
  fechaSolicitud: '2024-01-10T15:00:00.000Z',
  revisadoPor: colaboradores.administrador,
  fechaRevision: '2024-01-16T19:00:00.000Z',
} as const satisfies SolicitudPymeAprobada

export const solicitudPymePendiente = {
  id: fixtureIds.requests.pending,
  usuarioId: fixtureIds.users.buyerPymePending,
  nombreComercial: 'Estudio Araya Demo',
  identificacionNegocio: 'DEMO-NEG-003',
  actividadEconomica: 'Servicios de diseño',
  documentos: ['/fixtures/documentos/demo-araya-solicitud.pdf'],
  estado: 'pendiente',
  fechaSolicitud: '2026-11-03T14:20:00.000Z',
} as const satisfies SolicitudPyme

export const solicitudPymeRechazada = {
  id: fixtureIds.requests.rejected,
  usuarioId: fixtureIds.users.buyerPymeRejected,
  nombreComercial: 'Campos Consultoría Demo',
  identificacionNegocio: 'DEMO-NEG-004',
  actividadEconomica: 'Consultoría administrativa',
  documentos: ['/fixtures/documentos/demo-campos-documento.pdf'],
  estado: 'rechazada',
  fechaSolicitud: '2026-08-01T13:00:00.000Z',
  revisadoPor: colaboradores.administrador,
  fechaRevision: '2026-08-04T21:00:00.000Z',
  motivoRechazo: 'Documento demostrativo incompleto.',
} as const satisfies SolicitudPyme

export const solicitudPymeRevocada = {
  id: fixtureIds.requests.revoked,
  usuarioId: fixtureIds.users.buyerPymeRevoked,
  nombreComercial: 'Méndez Innovación Demo',
  identificacionNegocio: 'DEMO-NEG-005',
  actividadEconomica: 'Servicios tecnológicos',
  documentos: ['/fixtures/documentos/demo-mendez-respaldo.pdf'],
  estado: 'aprobada',
  fechaSolicitud: '2025-03-20T14:00:00.000Z',
  revisadoPor: colaboradores.administrador,
  fechaRevision: '2025-03-24T17:00:00.000Z',
} as const satisfies SolicitudPymeAprobada

export const solicitudesPyme = [
  solicitudPymeActiva,
  solicitudPymeVencida,
  solicitudPymePendiente,
  solicitudPymeRechazada,
  solicitudPymeRevocada,
] as const satisfies readonly SolicitudPyme[]

export const acreditacionesPyme = [
  {
    id: fixtureIds.accreditations.active,
    usuarioId: fixtureIds.users.buyerPymeActive,
    solicitudPyme: solicitudPymeActiva,
    fechaInicio: '2026-01-16T00:00:00.000Z',
    fechaVencimiento: '2027-12-31T23:59:59.000Z',
    estado: 'activa',
  },
  {
    id: fixtureIds.accreditations.expired,
    usuarioId: fixtureIds.users.buyerPymeExpired,
    solicitudPyme: solicitudPymeVencida,
    fechaInicio: '2024-01-17T00:00:00.000Z',
    fechaVencimiento: '2025-01-16T23:59:59.000Z',
    estado: 'vencida',
  },
  {
    id: fixtureIds.accreditations.revoked,
    usuarioId: fixtureIds.users.buyerPymeRevoked,
    solicitudPyme: solicitudPymeRevocada,
    fechaInicio: '2025-03-25T00:00:00.000Z',
    fechaVencimiento: '2027-03-24T23:59:59.000Z',
    estado: 'revocada',
  },
] as const satisfies readonly AcreditacionPyme[]
