import type { ProductInput } from '../../../services'

export type ProductFormErrors = Partial<Record<keyof ProductInput, string>>

export function validateProductInput(input: ProductInput): ProductFormErrors {
  const errors: ProductFormErrors = {}
  if (!input.nombre.trim()) errors.nombre = 'El nombre es obligatorio.'
  if (!input.descripcion.trim()) errors.descripcion = 'La descripción es obligatoria.'
  if (!input.categoriaId) errors.categoriaId = 'Selecciona una categoría.'
  if (!input.imagenUrl.trim()) errors.imagenUrl = 'Agrega una imagen o URL.'
  if (!Number.isFinite(input.precioRegular) || input.precioRegular < 0) {
    errors.precioRegular = 'El precio regular no puede ser negativo.'
  }
  if (!Number.isFinite(input.precioPyme) || input.precioPyme < 0) {
    errors.precioPyme = 'El precio PYME no puede ser negativo.'
  }
  if (!Number.isInteger(input.existencias) || input.existencias < 0) {
    errors.existencias = 'Las existencias deben ser un entero mayor o igual a cero.'
  }
  return errors
}
