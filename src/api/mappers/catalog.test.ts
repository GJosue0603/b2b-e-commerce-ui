import { describe, expect, it } from 'vitest'
import type { ApiCategory, ApiProduct } from '../contracts/catalog'
import { ApiResponseError } from '../http-client'
import { mapApiCategory, mapApiProduct } from './catalog'

const category: ApiCategory = {
  id: '65f000000000000000000001',
  nombre: 'Audio',
  descripcion: 'Productos de audio',
  activo: true,
  creadoPor: {
    id: '65f000000000000000000010',
    nombre: 'Administrador',
    rol: 'ADMINISTRADOR',
  },
  fechaCreacion: '2026-10-01T10:00:00Z',
}

const product: ApiProduct = {
  id: '65f000000000000000000002',
  nombre: 'Audífonos',
  descripcion: 'Audífonos inalámbricos',
  categoria: category,
  precioRegular: 34900,
  precioPyme: 31500,
  existencias: 12,
  imagenUrl: '/images/audifonos.jpg',
  activo: true,
  creadoPor: {
    id: '65f000000000000000000010',
    nombre: 'Administrador',
    rol: 'ADMINISTRADOR',
  },
  fechaCreacion: '2026-10-02T10:00:00Z',
}

describe('mapeadores del catálogo API', () => {
  it('mapea la categoría conservando el identificador real del backend', () => {
    expect(mapApiCategory(category)).toEqual({
      id: category.id,
      nombre: category.nombre,
      descripcion: category.descripcion,
      activo: true,
      creadoPor: {
        id: category.creadoPor.id,
        nombre: category.creadoPor.nombre,
      },
      fechaCreacion: category.fechaCreacion,
    })
  })

  it('mapea la categoría anidada del producto al categoriaId del dominio', () => {
    expect(mapApiProduct(product)).toEqual({
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      categoriaId: category.id,
      precioRegular: 34900,
      precioPyme: 31500,
      existencias: 12,
      imagenUrl: product.imagenUrl,
      activo: true,
      creadoPor: {
        id: product.creadoPor.id,
        nombre: product.creadoPor.nombre,
      },
      fechaCreacion: product.fechaCreacion,
    })
  })

  it('rechaza productos sin categoría válida en vez de fabricar una categoría', () => {
    expect(() =>
      mapApiProduct({ ...product, categoria: null }),
    ).toThrow(ApiResponseError)
  })
})
