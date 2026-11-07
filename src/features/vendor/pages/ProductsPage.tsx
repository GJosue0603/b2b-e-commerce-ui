import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Producto } from '../../../domain'
import { paths } from '../../../app/router/paths'
import { useAppServices } from '../../../app/services'
import { formatCRC } from '../../../shared/utils/pricing'
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  KpiCard,
  Select,
  Skeleton,
  TextField,
  type DataTableColumn,
} from '../../../shared/ui'
import { useManagedCatalog } from '../hooks/useManagedCatalog'
import { setProductActive } from '../usecases/updateProduct'
import './vendor-pages.css'

type StockFilter = 'todos' | 'disponible' | 'bajo' | 'agotado'

export interface ProductsPageProps {
  readonly supervision?: boolean
}

function stockState(product: Producto): Exclude<StockFilter, 'todos'> {
  if (product.existencias === 0) return 'agotado'
  if (product.existencias <= 5) return 'bajo'
  return 'disponible'
}

export function ProductsPage({ supervision = false }: ProductsPageProps) {
  const { catalog } = useAppServices()
  const { categories, error, loading, products, reload } = useManagedCatalog()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [stock, setStock] = useState<StockFilter>('todos')
  const [pendingToggle, setPendingToggle] = useState<Producto | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    return products.filter((product) =>
      (!normalized || `${product.nombre} ${product.descripcion}`.toLocaleLowerCase('es').includes(normalized)) &&
      (!categoryId || product.categoriaId === categoryId) &&
      (stock === 'todos' || stockState(product) === stock),
    )
  }, [categoryId, products, query, stock])

  const categoryNames = new Map(categories.map((category) => [category.id, category.nombre]))
  const columns: readonly DataTableColumn<Producto>[] = [
    {
      id: 'product',
      header: 'Producto',
      render: (product) => (
        <div className="vendor-product-cell">
          <img alt="" src={product.imagenUrl} />
          <div><strong>{product.nombre}</strong><span>{categoryNames.get(product.categoriaId) ?? 'Sin categoría'}</span></div>
        </div>
      ),
    },
    { id: 'regular', header: 'Precio regular', align: 'right', render: (product) => formatCRC(product.precioRegular) },
    { id: 'pyme', header: 'Precio PYME', align: 'right', render: (product) => formatCRC(product.precioPyme) },
    { id: 'stock', header: 'Existencias', align: 'center', render: (product) => product.existencias },
    {
      id: 'status',
      header: 'Estado',
      render: (product) => (
        <div className="vendor-statuses">
          <Badge variant={product.activo ? 'success' : 'neutral'}>{product.activo ? 'Activo' : 'Inactivo'}</Badge>
          <Badge variant={stockState(product) === 'agotado' ? 'danger' : stockState(product) === 'bajo' ? 'warning' : 'success'}>
            {stockState(product) === 'agotado' ? 'Agotado' : stockState(product) === 'bajo' ? 'Bajo stock' : 'Disponible'}
          </Badge>
        </div>
      ),
    },
    ...(!supervision
      ? [{
          id: 'actions',
          header: 'Acciones',
          align: 'right' as const,
          render: (product: Producto) => (
            <div className="vendor-row-actions">
              <Button onClick={() => navigate(paths.sellerProductEdit(product.id))} size="sm" variant="secondary">Editar</Button>
              <Button onClick={() => setPendingToggle(product)} size="sm" variant={product.activo ? 'danger' : 'ghost'}>{product.activo ? 'Desactivar' : 'Activar'}</Button>
            </div>
          ),
        }]
      : []),
  ]

  const confirmToggle = async () => {
    if (!pendingToggle) return
    setSaving(true)
    setActionError(null)
    try {
      await setProductActive(catalog, pendingToggle.id, !pendingToggle.activo)
      setPendingToggle(null)
      await reload()
    } catch {
      setActionError('No se pudo actualizar el estado del producto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="vendor-page">
      <header className="vendor-page__header">
        <div>
          <span className="vendor-eyebrow">{supervision ? 'Supervisión administrativa' : 'Gestión comercial'}</span>
          <h1>{supervision ? 'Supervisión de productos' : 'Productos e inventario'}</h1>
          <p>Catálogo compartido de NexoTech con precios regulares, PYME y existencias.</p>
        </div>
        {!supervision && <Button onClick={() => navigate(paths.sellerProductCreate)}>Nuevo producto</Button>}
      </header>

      {searchParams.get('guardado') && <Alert variant="success">El producto se guardó en el repositorio mock y ya está disponible según su estado.</Alert>}
      {(error || actionError) && <Alert variant="danger">{error ?? actionError}</Alert>}

      <div className="vendor-kpis">
        <KpiCard detail="Visibles en la tienda" label="Productos activos" tone="success" value={products.filter((product) => product.activo).length} />
        <KpiCard detail="1 a 5 unidades" label="Bajo inventario" tone="warning" value={products.filter((product) => stockState(product) === 'bajo').length} />
        <KpiCard detail="Sin existencias" label="Agotados" tone="danger" value={products.filter((product) => stockState(product) === 'agotado').length} />
      </div>

      <div className="vendor-filters">
        <TextField label="Buscar productos" onChange={(event) => setQuery(event.target.value)} placeholder="Nombre o descripción" type="search" value={query} />
        <Select label="Categoría" onChange={(event) => setCategoryId(event.target.value)} value={categoryId}>
          <option value="">Todas</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
        </Select>
        <Select label="Inventario" onChange={(event) => setStock(event.target.value as StockFilter)} value={stock}>
          <option value="todos">Todos</option>
          <option value="disponible">Disponible</option>
          <option value="bajo">Bajo stock</option>
          <option value="agotado">Agotado</option>
        </Select>
      </div>

      {loading ? (
        <Skeleton height="18rem" />
      ) : filteredProducts.length === 0 ? (
        <EmptyState description="Prueba otra búsqueda o combinación de filtros." title="No hay productos que coincidan" />
      ) : (
        <DataTable caption="Productos administrados en NexoTech" columns={columns} getRowKey={(product) => product.id} rows={filteredProducts} />
      )}

      <ConfirmDialog
        confirmLabel={pendingToggle?.activo ? 'Desactivar' : 'Activar'}
        confirmLoading={saving}
        destructive={pendingToggle?.activo}
        onCancel={() => setPendingToggle(null)}
        onConfirm={() => void confirmToggle()}
        open={Boolean(pendingToggle)}
        title={pendingToggle?.activo ? 'Desactivar producto' : 'Activar producto'}
      >
        <p>{pendingToggle?.activo ? 'El producto dejará de aparecer en la tienda pública.' : 'El producto volverá a aparecer si su categoría también está activa.'}</p>
      </ConfirmDialog>
    </section>
  )
}
