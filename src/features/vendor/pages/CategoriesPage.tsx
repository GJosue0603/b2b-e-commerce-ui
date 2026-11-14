import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ApiPage } from '../../../api/contracts/common'
import { ApiHttpError } from '../../../api/http-client'
import { createAdminCategoriesService } from '../../../api/services/admin-categories'
import { useAppServices } from '../../../app/services'
import type { Categoria, Producto } from '../../../domain'
import { useAuth } from '../../auth/state'
import { resolveCatalogDataMode } from '../../catalog/hooks/useCatalogReader'
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
import { getAdminApiErrorMessage } from '../../admin/admin-api-errors'
import { CategoryDialog } from '../components'
import './vendor-pages.css'

const adminCategoriesApi = createAdminCategoriesService()
const PAGE_SIZE = 25

export function CategoriesPage() {
  const { catalog } = useAppServices()
  const { authMode, signOut, user } = useAuth()
  const apiMode = resolveCatalogDataMode() === 'api'
  const canManageApiCategories =
    authMode === 'api' && user?.rol === 'administrador'
  const [categories, setCategories] = useState<readonly Categoria[]>([])
  const [products, setProducts] = useState<readonly Producto[]>([])
  const [page, setPage] = useState(1)
  const [pageInfo, setPageInfo] = useState<Pick<
    ApiPage<Categoria>,
    'cantidadTotalDeItems' | 'numeroDePagina' | 'totalDePaginas'
  > | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [pendingDeactivate, setPendingDeactivate] = useState<Categoria | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const reload = useCallback(async (signal?: AbortSignal) => {
    try {
      if (apiMode) {
        const result = await adminCategoriesApi.listCategoriesPage(
          { numeroDePagina: page, cantidadPorPagina: PAGE_SIZE },
          { signal },
        )
        if (signal?.aborted) return
        setCategories(result.items)
        setPageInfo({
          cantidadTotalDeItems: result.cantidadTotalDeItems,
          numeroDePagina: result.numeroDePagina,
          totalDePaginas: result.totalDePaginas,
        })
        setProducts([])
        return
      }

      const [nextCategories, nextProducts] = await Promise.all([
        catalog.listManagedCategories({ signal }),
        catalog.listManagedProducts({ signal }),
      ])
      if (signal?.aborted) return
      setCategories(nextCategories)
      setProducts(nextProducts)
      setPageInfo(null)
    } catch (reason) {
      if (signal?.aborted) return
      if (reason instanceof ApiHttpError && reason.status === 401) {
        void signOut()
      }
      setError(
        apiMode
          ? getAdminApiErrorMessage(reason, 'categoría')
          : 'No se pudo cargar el catálogo demostrativo.',
      )
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [apiMode, catalog, page, signOut])

  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve().then(() => reload(controller.signal))
    return () => controller.abort()
  }, [reload])

  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    if (!normalized) return categories
    return categories.filter((category) =>
      `${category.nombre} ${category.descripcion}`.toLocaleLowerCase('es').includes(normalized),
    )
  }, [categories, query])

  const openCreate = () => {
    setEditing(null)
    setActionError(null)
    setDialogOpen(true)
  }
  const openEdit = (category: Categoria) => {
    setEditing(category)
    setActionError(null)
    setDialogOpen(true)
  }

  const showActionError = (reason: unknown) => {
    if (reason instanceof ApiHttpError && reason.status === 401) {
      void signOut()
    }
    setActionError(
      apiMode
        ? getAdminApiErrorMessage(reason, 'categoría')
        : 'No se pudo completar la operación demostrativa.',
    )
  }

  const saveCategory = async (input: CategoryInput) => {
    if (apiMode && !canManageApiCategories) {
      setActionError('La gestión real de categorías requiere una sesión API con rol ADMINISTRADOR.')
      return
    }

    setSaving(true)
    setActionError(null)
    setError(null)
    try {
      if (editing) {
        if (apiMode) {
          await adminCategoriesApi.updateCategory(editing.id, input)
        } else {
          await catalog.updateCategory(editing.id, input)
        }
      } else if (apiMode) {
        await adminCategoriesApi.createCategory(input)
      } else {
        await catalog.createCategory(input)
      }
      setNotice(editing ? 'Categoría actualizada.' : 'Categoría creada.')
      setDialogOpen(false)
      setLoading(true)
      await reload()
    } catch (reason) {
      showActionError(reason)
    } finally {
      setSaving(false)
    }
  }

  const deactivateCategory = async () => {
    if (!pendingDeactivate) return
    if (apiMode && !canManageApiCategories) {
      setActionError('La gestión real de categorías requiere una sesión API con rol ADMINISTRADOR.')
      return
    }

    setSaving(true)
    setActionError(null)
    setError(null)
    try {
      if (apiMode) {
        await adminCategoriesApi.deactivateCategory(pendingDeactivate.id)
      } else {
        await catalog.setCategoryActive(pendingDeactivate.id, false)
      }
      setNotice('Categoría desactivada.')
      setPendingDeactivate(null)
      setLoading(true)
      await reload()
    } catch (reason) {
      showActionError(reason)
    } finally {
      setSaving(false)
    }
  }

  const columns: readonly DataTableColumn<Categoria>[] = [
    { id: 'name', header: 'Nombre', render: (category) => <strong>{category.nombre}</strong> },
    { id: 'description', header: 'Descripción', render: (category) => category.descripcion },
    ...(!apiMode
      ? [{
          id: 'products',
          header: 'Productos',
          align: 'center' as const,
          render: (category: Categoria) =>
            products.filter((product) => product.categoriaId === category.id).length,
        }]
      : []),
    { id: 'status', header: 'Estado', render: (category) => <Badge variant={category.activo ? 'success' : 'neutral'}>{category.activo ? 'Activa' : 'Inactiva'}</Badge> },
    {
      id: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (category) => (
        <div className="vendor-row-actions">
          {category.activo && (
            <>
              <Button disabled={apiMode && !canManageApiCategories} onClick={() => openEdit(category)} size="sm" variant="secondary">Editar</Button>
              <Button disabled={apiMode && !canManageApiCategories} onClick={() => setPendingDeactivate(category)} size="sm" variant="danger">Desactivar</Button>
            </>
          )}
          {!category.activo && <span>Sin acciones disponibles</span>}
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
        <Button disabled={apiMode && !canManageApiCategories} onClick={openCreate}>Nueva categoría</Button>
      </header>

      {apiMode && !canManageApiCategories && (
        <Alert title="Gestión en modo lectura">Las categorías son públicas, pero crear, editar y desactivar requiere autenticación API con rol ADMINISTRADOR.</Alert>
      )}
      {notice && <Alert onDismiss={() => setNotice(null)} variant="success">{notice}</Alert>}
      {(error || actionError) && <Alert variant="danger">{error ?? actionError}</Alert>}

      <div className="vendor-kpis">
        <KpiCard label={pageInfo ? 'Total categorías' : 'Total categorías demo'} value={pageInfo?.cantidadTotalDeItems ?? categories.length} />
        <KpiCard label={pageInfo ? 'Activas en página' : 'Categorías activas'} tone="success" value={categories.filter((category) => category.activo).length} />
        <KpiCard label={pageInfo ? 'Inactivas en página' : 'Categorías inactivas'} value={categories.filter((category) => !category.activo).length} />
      </div>

      <div className="vendor-filters vendor-filters--single">
        <TextField label={apiMode ? 'Buscar en esta página' : 'Buscar categorías'} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre o descripción" type="search" value={query} />
      </div>

      {loading ? <Skeleton height="16rem" /> : error ? null : filteredCategories.length === 0 ? (
        <EmptyState description={query ? 'Prueba con otra palabra clave.' : 'Aún no hay categorías disponibles.'} title={query ? 'No hay categorías que coincidan' : 'No hay categorías'} />
      ) : (
        <DataTable caption="Categorías del catálogo NexoTech" columns={columns} getRowKey={(category) => category.id} rows={filteredCategories} />
      )}

      {pageInfo && !loading && !error && (
        <div className="vendor-filters vendor-filters--single" aria-label="Paginación de categorías">
          <span>Página {pageInfo.numeroDePagina} de {pageInfo.totalDePaginas} · {pageInfo.cantidadTotalDeItems} categorías</span>
          <div className="vendor-row-actions">
            <Button disabled={pageInfo.numeroDePagina <= 1} onClick={() => { setLoading(true); setError(null); setPage((current) => Math.max(1, current - 1)) }} variant="secondary">Anterior</Button>
            <Button disabled={pageInfo.numeroDePagina >= pageInfo.totalDePaginas} onClick={() => { setLoading(true); setError(null); setPage((current) => current + 1) }} variant="secondary">Siguiente</Button>
          </div>
        </div>
      )}

      <Alert title="Alcance del catálogo">Esta herramienta gestiona solo categorías del catálogo propio de NexoTech; no administra proveedores ni tiendas externas.</Alert>

      {dialogOpen && (
        <CategoryDialog category={editing} key={editing?.id ?? 'new'} loading={saving} onClose={() => setDialogOpen(false)} onSubmit={saveCategory} open />
      )}
      <ConfirmDialog
        confirmLabel="Desactivar"
        confirmLoading={saving}
        destructive
        onCancel={() => setPendingDeactivate(null)}
        onConfirm={() => void deactivateCategory()}
        open={Boolean(pendingDeactivate)}
        title="Desactivar categoría"
      >
        <p>La categoría dejará de mostrarse en navegación, catálogo y detalle público. Esta acción no elimina sus datos.</p>
      </ConfirmDialog>
    </section>
  )
}
