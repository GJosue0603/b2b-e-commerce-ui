import { describe, expect, it } from 'vitest'
import { validateProductInput } from './product-validation'

const validInput = {
  activo: true,
  categoriaId: 'categoria',
  descripcion: 'Descripción',
  existencias: 3,
  imagenUrl: '/imagen.webp',
  nombre: 'Producto',
  precioPyme: 900,
  precioRegular: 1_000,
}

describe('validación de ProductForm', () => {
  it('rechaza precios negativos y existencias negativas o decimales', () => {
    expect(validateProductInput({ ...validInput, precioRegular: -1 })).toHaveProperty('precioRegular')
    expect(validateProductInput({ ...validInput, precioPyme: -1 })).toHaveProperty('precioPyme')
    expect(validateProductInput({ ...validInput, existencias: -1 })).toHaveProperty('existencias')
    expect(validateProductInput({ ...validInput, existencias: 1.5 })).toHaveProperty('existencias')
  })

  it('marca campos requeridos vacíos', () => {
    const errors = validateProductInput({
      ...validInput,
      categoriaId: '',
      descripcion: '',
      imagenUrl: '',
      nombre: '',
    })
    expect(errors).toMatchObject({
      categoriaId: expect.any(String),
      descripcion: expect.any(String),
      imagenUrl: expect.any(String),
      nombre: expect.any(String),
    })
  })
})
