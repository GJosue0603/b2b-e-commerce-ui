import { useMemo, useState } from 'react'
import { useAppServices } from '../../../app/services'
import type { Categoria } from '../../../domain'
import type { CategoryInput } from '../../../services'
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  KpiCard,
  Skeleton,
  TextField,
  type DataTableColumn,
} from '../../../shared/ui'
import { CategoryDialog } from '../components'
import { useManagedCatalog } from '../hooks/useManagedCatalog'
import './vendor-pages.css'

export function CategoriesPage() {
  const { catalog } = useAppServices()
  const { categories, error, loading, products, reload } = useManagedCatalog()
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [pendingToggle, setPendingToggle] = useState<Categoria | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    if (!normalized) return categories
    return categories.filter((category) =>
      `${category.nombre} ${category.descripcion}`.toLocaleLowerCase('es').includes(normalized),
    )
  }, [categories, query])

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (category: Categoria) => {
    setEditing(category)
    setDialogOpen(true)
  }

  const saveCategory = async (input: CategoryInput) => {
    setSaving(true)
    setActionError(null)
    try {
      if (editing) await catalog.updateCategory(editing.id, input)
      else await catalog.createCategory(input)
      setNotice(editing ? 'Categoría actualizada.' : 'Categoría creada.')
      setDialogOpen(false)
      await reload()
    } catch {
      setActionError('No se pudo guardar la categoría demostrativa.')
    } finally {
      setSaving(false)
    }
  }

  const toggleCategory = async () => {
    if (!pendingToggle) return
    setSaving(true)
    setActionError(null)
    try {
      await catalog.setCategoryActive(pendingToggle.id, !pendingToggle.activo)
      setNotice(pendingToggle.activo ? 'Categoría desactivada en la tienda pública.' : 'Categoría activada.')
      setPendingToggle(null)
      await reload()
    } catch {
      setActionError('No se pudo cambiar el estado de la categoría.')
    } finally {
      setSaving(false)
    }
  }

  const columns: readonly DataTableColumn<Categoria>[] = [
    { id: 'name', header: 'Nombre', render: (category) => <strong>{category.nombre}</strong> },
    { id: 'description', header: 'Descripción', render: (category) => category.descripcion },
    { id: 'products', header: 'Productos', align: 'center', render: (category) => products.filter((product) => product.categoriaId === category.id).length },
    { id: 'status', header: 'Estado', render: (category) => <Badge variant={category.activo ? 'success' : 'neutral'}>{category.activo ? 'Activa' : 'Inactiva'}</Badge> },
    {
      id: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (category) => (
        <div className="vendor-row-actions">
          <Button onClick={() => openEdit(category)} size="sm" variant="secondary">Editar</Button>
          <Button onClick={() => setPendingToggle(category)} size="sm" variant={category.activo ? 'danger' : 'ghost'}>{category.activo ? 'Desactivar' : 'Activar'}</Button>
        </div>
      ),
    },
  ]

  return (
    <section className="vendor-page">
      <header className="vendor-page__header">
        <div>
          <h1 className="dashboard-page-title">Categorías de productos</h1>
          <p>Organiza la taxonomía del catálogo propio de NexoTech.</p>
        </div>
        <Button onClick={openCreate}>Nueva categoría</Button>
      </header>

      {notice && <Alert onDismiss={() => setNotice(null)} variant="success">{notice}</Alert>}
      {(error || actionError) && <Alert variant="danger">{error ?? actionError}</Alert>}

      <div className="vendor-kpis">
        <KpiCard label="Total categorías" value={categories.length} />
        <KpiCard label="Categorías activas" tone="success" value={categories.filter((category) => category.activo).length} />
        <KpiCard label="Categorías inactivas" value={categories.filter((category) => !category.activo).length} />
      </div>

      <div className="vendor-filters vendor-filters--single">
        <TextField label="Buscar categorías" onChange={(event) => setQuery(event.target.value)} placeholder="Nombre o descripción" type="search" value={query} />
      </div>

      {loading ? <Skeleton height="16rem" /> : filteredCategories.length === 0 ? (
        <EmptyState description="Prueba con otra palabra clave." title="No hay categorías que coincidan" />
      ) : (
        <DataTable caption="Categorías del catálogo NexoTech" columns={columns} getRowKey={(category) => category.id} rows={filteredCategories} />
      )}

      <Alert title="Alcance del catálogo">Esta herramienta gestiona solo categorías del catálogo propio de NexoTech; no administra proveedores ni tiendas externas.</Alert>

      {dialogOpen && (
        <CategoryDialog category={editing} key={editing?.id ?? 'new'} loading={saving} onClose={() => setDialogOpen(false)} onSubmit={saveCategory} open />
      )}
      <ConfirmDialog
        confirmLabel={pendingToggle?.activo ? 'Desactivar' : 'Activar'}
        confirmLoading={saving}
        destructive={pendingToggle?.activo}
        onCancel={() => setPendingToggle(null)}
        onConfirm={() => void toggleCategory()}
        open={Boolean(pendingToggle)}
        title={pendingToggle?.activo ? 'Desactivar categoría' : 'Activar categoría'}
      >
        <p>{pendingToggle?.activo ? 'Sus productos dejarán de mostrarse en navegación, catálogo y detalle público.' : 'La categoría y sus productos activos volverán a estar disponibles.'}</p>
      </ConfirmDialog>
    </section>
  )
}
