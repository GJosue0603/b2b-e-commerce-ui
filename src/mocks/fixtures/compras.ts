import type { Carrito, Pago, Pedido } from '../../domain'
import { fixtureIds } from './ids'

export const carritos = [
  {
    id: fixtureIds.carts.regular,
    usuarioId: fixtureIds.users.buyerRegular,
    items: [
      { productoId: fixtureIds.products.keyboard, cantidad: 1 },
      { productoId: fixtureIds.products.mouse, cantidad: 1 },
    ],
    fechaCreacion: '2026-11-01T14:00:00.000Z',
    fechaModificacion: '2026-11-01T14:05:00.000Z',
  },
  {
    id: fixtureIds.carts.pyme,
    usuarioId: fixtureIds.users.buyerPymeActive,
    items: [
      { productoId: fixtureIds.products.keyboard, cantidad: 1 },
      { productoId: fixtureIds.products.mouse, cantidad: 1 },
    ],
    fechaCreacion: '2026-11-02T15:00:00.000Z',
    fechaModificacion: '2026-11-02T15:04:00.000Z',
  },
  {
    id: fixtureIds.carts.pymeExpired,
    usuarioId: fixtureIds.users.buyerPymeExpired,
    items: [
      { productoId: fixtureIds.products.keyboard, cantidad: 1 },
      { productoId: fixtureIds.products.mouse, cantidad: 1 },
    ],
    fechaCreacion: '2026-11-03T15:00:00.000Z',
    fechaModificacion: '2026-11-03T15:04:00.000Z',
  },
  {
    id: fixtureIds.carts.pymeRevoked,
    usuarioId: fixtureIds.users.buyerPymeRevoked,
    items: [
      { productoId: fixtureIds.products.keyboard, cantidad: 1 },
      { productoId: fixtureIds.products.mouse, cantidad: 1 },
    ],
    fechaCreacion: '2026-11-04T15:00:00.000Z',
    fechaModificacion: '2026-11-04T15:04:00.000Z',
  },
] as const satisfies readonly Carrito[]

export const pagos = [
  {
    id: fixtureIds.payments.regularApproved,
    usuarioId: fixtureIds.users.buyerRegular,
    proveedor: 'Pasarela externa simulada',
    referenciaExterna: 'DEMO-PAY-REGULAR-001',
    monto: 61_800,
    estado: 'aprobado',
    fechaPago: '2026-10-20T16:20:00.000Z',
  },
  {
    id: fixtureIds.payments.pymeApproved,
    usuarioId: fixtureIds.users.buyerPymeActive,
    proveedor: 'Pasarela externa simulada',
    referenciaExterna: 'DEMO-PAY-PYME-001',
    monto: 56_400,
    estado: 'aprobado',
    fechaPago: '2026-11-02T15:15:00.000Z',
  },
  {
    id: fixtureIds.payments.rejected,
    usuarioId: fixtureIds.users.buyerRegular,
    proveedor: 'Pasarela externa simulada',
    referenciaExterna: 'DEMO-PAY-RECHAZADO-001',
    monto: 61_800,
    estado: 'rechazado',
    fechaPago: '2026-11-04T18:00:00.000Z',
  },
  {
    id: fixtureIds.payments.canceled,
    usuarioId: fixtureIds.users.buyerRegular,
    proveedor: 'Pasarela externa simulada',
    referenciaExterna: 'DEMO-PAY-CANCELADO-001',
    monto: 61_800,
    estado: 'cancelado',
    fechaPago: '2026-11-05T19:00:00.000Z',
  },
] as const satisfies readonly Pago[]

export const pedidos = [
  {
    id: fixtureIds.orders.regular,
    usuarioId: fixtureIds.users.buyerRegular,
    pagoId: fixtureIds.payments.regularApproved,
    items: [
      {
        productoId: fixtureIds.products.keyboard,
        nombreProducto: 'Teclado mecánico inalámbrico',
        precioUnitario: 42_900,
        cantidad: 1,
        subtotal: 42_900,
      },
      {
        productoId: fixtureIds.products.mouse,
        nombreProducto: 'Mouse ergonómico',
        precioUnitario: 18_900,
        cantidad: 1,
        subtotal: 18_900,
      },
    ],
    subtotal: 61_800,
    descuento: 0,
    total: 61_800,
    fechaPedido: '2026-10-20T16:21:00.000Z',
  },
  {
    id: fixtureIds.orders.pyme,
    usuarioId: fixtureIds.users.buyerPymeActive,
    pagoId: fixtureIds.payments.pymeApproved,
    items: [
      {
        productoId: fixtureIds.products.keyboard,
        nombreProducto: 'Teclado mecánico inalámbrico',
        precioUnitario: 39_900,
        cantidad: 1,
        subtotal: 39_900,
      },
      {
        productoId: fixtureIds.products.mouse,
        nombreProducto: 'Mouse ergonómico',
        precioUnitario: 16_500,
        cantidad: 1,
        subtotal: 16_500,
      },
    ],
    subtotal: 61_800,
    descuento: 5_400,
    total: 56_400,
    fechaPedido: '2026-11-02T15:16:00.000Z',
  },
] as const satisfies readonly Pedido[]
