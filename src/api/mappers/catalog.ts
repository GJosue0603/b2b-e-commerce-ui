import type { Categoria, Colaborador, Producto } from '../../domain'
import type { ApiCategory, ApiProduct } from '../contracts/catalog'
import type { ApiCollaborator } from '../contracts/common'
import { ApiResponseError } from '../http-client'

function mapCollaborator(collaborator: ApiCollaborator): Colaborador {
  return {
    id: collaborator.id,
    nombre: collaborator.nombre,
  }
}

export function mapApiCategory(category: ApiCategory): Categoria {
  return {
    id: category.id,
    nombre: category.nombre,
    descripcion: category.descripcion,
    activo: category.activo,
    ...(category.creadoPor
      ? { creadoPor: mapCollaborator(category.creadoPor) }
      : {}),
    fechaCreacion: category.fechaCreacion,
    ...(category.modificadoPor
      ? { modificadoPor: mapCollaborator(category.modificadoPor) }
      : {}),
    ...(category.fechaModificacion
      ? { fechaModificacion: category.fechaModificacion }
      : {}),
  }
}

export function mapApiProduct(product: ApiProduct): Producto {
  if (!product.categoria?.id) {
    throw new ApiResponseError(
      `El producto ${product.id} no contiene una categoría válida.`,
    )
  }

  return {
    id: product.id,
    nombre: product.nombre,
    descripcion: product.descripcion,
    categoriaId: product.categoria.id,
    precioRegular: product.precioRegular,
    precioPyme: product.precioPyme,
    existencias: product.existencias,
    imagenUrl: product.imagenUrl,
    activo: product.activo,
    ...(product.creadoPor
      ? { creadoPor: mapCollaborator(product.creadoPor) }
      : {}),
    fechaCreacion: product.fechaCreacion,
    ...(product.modificadoPor
      ? { modificadoPor: mapCollaborator(product.modificadoPor) }
      : {}),
    ...(product.fechaModificacion
      ? { fechaModificacion: product.fechaModificacion }
      : {}),
  }
}
