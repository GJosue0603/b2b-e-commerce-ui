import type { Categoria, Producto } from '../../../domain'
import { Badge, DataTable, EmptyState, type DataTableColumn } from '../../../shared/ui'

export interface LowStockTableProps {
  readonly categories: readonly Categoria[]
  readonly products: readonly Producto[]
}

export function LowStockTable({ categories, products }: LowStockTableProps) {
  if (products.length === 0) {
    return <EmptyState description="No hay productos activos con cinco unidades o menos." title="Inventario sin alertas" />
  }
  const categoryNames = new Map(categories.map((category) => [category.id, category.nombre]))
  const columns: readonly DataTableColumn<Producto>[] = [
    { id: 'product', header: 'Producto', render: (product) => <strong>{product.nombre}</strong> },
    { id: 'category', header: 'Categoría', render: (product) => categoryNames.get(product.categoriaId) ?? 'Sin categoría' },
    { id: 'stock', header: 'Existencias', align: 'center', render: (product) => product.existencias },
    { id: 'status', header: 'Estado', render: (product) => <Badge variant={product.existencias === 0 ? 'danger' : 'warning'}>{product.existencias === 0 ? 'Agotado' : 'Bajo stock'}</Badge> },
  ]
  return <DataTable caption="Productos activos con inventario bajo" columns={columns} getRowKey={(product) => product.id} rows={products} />
}
