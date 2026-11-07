import type { Colaborador, Usuario } from '../../domain'
import { fixtureIds } from './ids'

export const colaboradores = {
  vendedor: {
    id: fixtureIds.users.seller,
    nombre: 'Valeria Vendedora',
  },
  administrador: {
    id: fixtureIds.users.administrator,
    nombre: 'Adrián Administrador',
  },
} as const satisfies Record<string, Colaborador>

export const compradores = [
  {
    id: fixtureIds.users.buyerRegular,
    nombre: 'Camila',
    apellidos: 'Rojas Mora',
    correo: 'camila.regular@nexotech.demo.test',
    telefono: '+506 0000-0001',
    rol: 'comprador',
    activo: true,
    fechaCreacion: '2026-01-10T14:00:00.000Z',
  },
  {
    id: fixtureIds.users.buyerPymeActive,
    nombre: 'Diego',
    apellidos: 'Solano Vega',
    correo: 'diego.pyme@nexotech.demo.test',
    telefono: '+506 0000-0002',
    rol: 'comprador',
    activo: true,
    fechaCreacion: '2025-11-08T16:30:00.000Z',
  },
  {
    id: fixtureIds.users.buyerPymeExpired,
    nombre: 'Elena',
    apellidos: 'Jiménez Castro',
    correo: 'elena.vencida@nexotech.demo.test',
    telefono: '+506 0000-0003',
    rol: 'comprador',
    activo: true,
    fechaCreacion: '2024-08-20T20:15:00.000Z',
  },
  {
    id: fixtureIds.users.buyerPymePending,
    nombre: 'Marco',
    apellidos: 'Araya León',
    correo: 'marco.pendiente@nexotech.demo.test',
    telefono: '+506 0000-0004',
    rol: 'comprador',
    activo: true,
    fechaCreacion: '2026-09-02T13:45:00.000Z',
  },
  {
    id: fixtureIds.users.buyerPymeRejected,
    nombre: 'Natalia',
    apellidos: 'Campos Ruiz',
    correo: 'natalia.rechazada@nexotech.demo.test',
    telefono: '+506 0000-0005',
    rol: 'comprador',
    activo: true,
    fechaCreacion: '2026-07-15T18:20:00.000Z',
  },
] as const satisfies readonly Usuario[]

export const usuariosInternos = [
  {
    id: fixtureIds.users.seller,
    nombre: 'Valeria',
    apellidos: 'Vendedora Demo',
    correo: 'vendedor@nexotech.demo.test',
    telefono: '+506 0000-0101',
    rol: 'vendedor',
    activo: true,
    fechaCreacion: '2025-10-01T15:00:00.000Z',
  },
  {
    id: fixtureIds.users.administrator,
    nombre: 'Adrián',
    apellidos: 'Administrador Demo',
    correo: 'admin@nexotech.demo.test',
    telefono: '+506 0000-0102',
    rol: 'administrador',
    activo: true,
    fechaCreacion: '2025-10-01T15:00:00.000Z',
  },
] as const satisfies readonly Usuario[]

export const usuarios = [
  ...compradores,
  ...usuariosInternos,
] as const satisfies readonly Usuario[]
