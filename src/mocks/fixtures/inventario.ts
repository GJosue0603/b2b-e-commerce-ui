import type { InventarioProducto } from '../../domain'
import { fixtureIds } from './ids'

export const inventario = [
  {
    productoId: fixtureIds.products.keyboard,
    existencias: 18,
    estado: 'disponible',
    umbralBajo: 5,
    fechaActualizacion: '2026-11-06T12:00:00.000Z',
  },
  {
    productoId: fixtureIds.products.mouse,
    existencias: 7,
    estado: 'disponible',
    umbralBajo: 5,
    fechaActualizacion: '2026-11-06T12:00:00.000Z',
  },
  {
    productoId: fixtureIds.products.monitor,
    existencias: 0,
    estado: 'agotado',
    umbralBajo: 5,
    fechaActualizacion: '2026-11-06T12:00:00.000Z',
  },
  {
    productoId: fixtureIds.products.headphones,
    existencias: 23,
    estado: 'disponible',
    umbralBajo: 5,
    fechaActualizacion: '2026-11-06T12:00:00.000Z',
  },
  {
    productoId: fixtureIds.products.webcam,
    existencias: 4,
    estado: 'bajo',
    umbralBajo: 5,
    fechaActualizacion: '2026-11-06T12:00:00.000Z',
  },
] as const satisfies readonly InventarioProducto[]
