import type { CatalogRepository, ProductInput } from '../../../services'

export function createProduct(
  repository: CatalogRepository,
  input: ProductInput,
) {
  return repository.createProduct(input)
}
