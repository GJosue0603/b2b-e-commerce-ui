import { describe, expect, it } from 'vitest'
import {
  acreditacionesPyme,
  carritos,
  categorias,
  compradores,
  inventario,
  pagos,
  pedidos,
  productos,
  reportes,
  solicitudesPyme,
} from '.'

function findById<T extends { readonly id: string }>(
  collection: readonly T[],
  id: string,
) {
  const item = collection.find((candidate) => candidate.id === id)
  if (!item) throw new Error(`Fixture no encontrado: ${id}`)
  return item
}

function expectWholeColones(values: readonly number[]) {
  for (const value of values) {
    expect(Number.isInteger(value)).toBe(true)
    expect(value).toBeGreaterThanOrEqual(0)
  }
}

describe('fixtures de dominio', () => {
  it('mantiene productos, categorías e inventario relacionados', () => {
    expect(inventario).toHaveLength(productos.length)

    for (const producto of productos) {
      expect(categorias.some((categoria) => categoria.id === producto.categoriaId)).toBe(
        true,
      )

      const registro = inventario.find(
        (item) => item.productoId === producto.id,
      )
      expect(registro?.existencias).toBe(producto.existencias)

      const estadoEsperado =
        producto.existencias === 0
          ? 'agotado'
          : producto.existencias <= (registro?.umbralBajo ?? 0)
            ? 'bajo'
            : 'disponible'
      expect(registro?.estado).toBe(estadoEsperado)
    }
  })

  it('usa únicamente compradores para solicitudes y acreditaciones', () => {
    for (const solicitud of solicitudesPyme) {
      const comprador = findById(compradores, solicitud.usuarioId)
      expect(comprador.rol).toBe('comprador')
    }

    for (const acreditacion of acreditacionesPyme) {
      expect(acreditacion.solicitudPyme.estado).toBe('aprobada')
      expect(acreditacion.solicitudPyme.usuarioId).toBe(acreditacion.usuarioId)
    }

    const usuariosConAcreditacionActiva = acreditacionesPyme
      .filter((acreditacion) => acreditacion.estado === 'activa')
      .map((acreditacion) => acreditacion.usuarioId)
    expect(new Set(usuariosConAcreditacionActiva).size).toBe(
      usuariosConAcreditacionActiva.length,
    )
  })

  it('conserva carritos con productos y cantidades válidas', () => {
    for (const carrito of carritos) {
      findById(compradores, carrito.usuarioId)

      for (const item of carrito.items) {
        findById(productos, item.productoId)
        expect(Number.isInteger(item.cantidad)).toBe(true)
        expect(item.cantidad).toBeGreaterThan(0)
      }
    }
  })

  it('solo genera pedidos desde pagos aprobados y mantiene sus totales', () => {
    for (const pedido of pedidos) {
      const pago = findById(pagos, pedido.pagoId)
      expect(pago.estado).toBe('aprobado')
      expect(pago.usuarioId).toBe(pedido.usuarioId)
      expect(pago.monto).toBe(pedido.total)
      expect(pedido.total).toBe(pedido.subtotal - pedido.descuento)

      const totalItems = pedido.items.reduce((total, item) => {
        findById(productos, item.productoId)
        expect(item.subtotal).toBe(item.precioUnitario * item.cantidad)
        return total + item.subtotal
      }, 0)
      expect(totalItems).toBe(pedido.total)
    }

    const pagosSinPedido = pagos.filter((pago) => pago.estado !== 'aprobado')
    const pagosConPedido = new Set<string>(pedidos.map((pedido) => pedido.pagoId))
    for (const pago of pagosSinPedido) {
      expect(pagosConPedido.has(pago.id)).toBe(false)
    }
  })

  it('reproduce los importes Stitch del carrito regular y PYME', () => {
    const teclado = productos.find((producto) =>
      producto.nombre.startsWith('Teclado mecánico'),
    )
    const mouse = productos.find((producto) =>
      producto.nombre.startsWith('Mouse ergonómico'),
    )

    expect(teclado?.precioRegular).toBe(42_900)
    expect(teclado?.precioPyme).toBe(39_900)
    expect(mouse?.precioRegular).toBe(18_900)
    expect(mouse?.precioPyme).toBe(16_500)
    expect((teclado?.precioRegular ?? 0) + (mouse?.precioRegular ?? 0)).toBe(
      61_800,
    )
    expect((teclado?.precioPyme ?? 0) + (mouse?.precioPyme ?? 0)).toBe(
      56_400,
    )
  })

  it('expresa todos los montos de demostración en colones enteros', () => {
    const montos = [
      ...productos.flatMap((producto) => [
        producto.precioRegular,
        producto.precioPyme,
      ]),
      ...pagos.map((pago) => pago.monto),
      ...pedidos.flatMap((pedido) => [
        pedido.subtotal,
        pedido.descuento,
        pedido.total,
        ...pedido.items.flatMap((item) => [item.precioUnitario, item.subtotal]),
      ]),
      ...reportes.flatMap((reporte) => [
        reporte.indicadores.ingresos,
        reporte.indicadores.ticketPromedio,
        ...reporte.tendencia.map((punto) => punto.ingresos),
        ...reporte.ventasPorCategoria.map((categoria) => categoria.ingresos),
        ...reporte.productosMasVendidos.map((producto) => producto.ingresos),
        ...reporte.productosMenosVendidos.map((producto) => producto.ingresos),
      ]),
    ]

    expectWholeColones(montos)
  })

  it('deriva el reporte demostrativo de los pedidos disponibles', () => {
    const reporte = reportes[0]
    const ingresos = pedidos.reduce((total, pedido) => total + pedido.total, 0)
    const unidades = pedidos.reduce(
      (total, pedido) =>
        total + pedido.items.reduce((suma, item) => suma + item.cantidad, 0),
      0,
    )

    expect(reporte.demostrativo).toBe(true)
    expect(reporte.indicadores.cantidadVentas).toBe(pedidos.length)
    expect(reporte.indicadores.ingresos).toBe(ingresos)
    expect(reporte.indicadores.unidadesVendidas).toBe(unidades)
    expect(reporte.indicadores.ticketPromedio).toBe(ingresos / pedidos.length)

    for (const item of reporte.ventasPorCategoria) {
      findById(categorias, item.categoriaId)
    }
    for (const item of [
      ...reporte.productosMasVendidos,
      ...reporte.productosMenosVendidos,
    ]) {
      findById(productos, item.productoId)
    }
    for (const productoId of reporte.productosBajoInventario) {
      const registro = inventario.find((item) => item.productoId === productoId)
      expect(['bajo', 'agotado']).toContain(registro?.estado)
    }
  })

  it('no contiene contraseñas ni referencias de producción', () => {
    const serialized = JSON.stringify({ compradores, pagos, solicitudesPyme })

    expect(serialized.toLowerCase()).not.toContain('contrasena')
    expect(serialized.toLowerCase()).not.toContain('password')
    expect(compradores.every((usuario) => usuario.correo.endsWith('.test'))).toBe(
      true,
    )
    expect(
      pagos.every((pago) => pago.referenciaExterna.startsWith('DEMO-PAY-')),
    ).toBe(true)
  })
})
