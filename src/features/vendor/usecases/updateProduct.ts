import type { CatalogRepository, ProductInput } from '../../../services'

export function updateProduct(
  repository: CatalogRepository,
  productId: string,
  input: ProductInput,
) {
  return repository.updateProduct(productId, input)
}

export function setProductActive(
  repository: CatalogRepository,
  productId: string,
  active: boolean,
) {
  return repository.setProductActive(productId, active)
}
