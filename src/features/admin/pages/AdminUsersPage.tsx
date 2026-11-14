import { useEffect, useMemo, useState } from 'react'
import type { ApiPage } from '../../../api/contracts/common'
import { ApiHttpError } from '../../../api/http-client'
import { createAdminUsersService } from '../../../api/services/admin-users'
import { useAppServices } from '../../../app/services'
import type { RolUsuario, Usuario } from '../../../domain'
import { useAuth } from '../../auth/state'
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  KpiCard,
  Modal,
  Skeleton,
  TextField,
} from '../../../shared/ui'
import { getAdminApiErrorMessage } from '../admin-api-errors'
import { formatAdminDate } from './admin-utils'
import './admin-pages.css'

const adminUsersApi = createAdminUsersService()
const PAGE_SIZE = 25

export function AdminUsersPage() {
  const { pyme, users } = useAppServices()
  const { authMode, signOut } = useAuth()
  const [directory, setDirectory] = useState<readonly Usuario[]>([])
  const [pymeUserIds, setPymeUserIds] = useState<ReadonlySet<string>>(new Set())
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<RolUsuario | 'todos'>('todos')
  const [page, setPage] = useState(1)
  const [pageInfo, setPageInfo] = useState<Pick<
    ApiPage<Usuario>,
    'cantidadTotalDeItems' | 'numeroDePagina' | 'totalDePaginas'
  > | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [detailUser, setDetailUser] = useState<Usuario | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string>()

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    const loadDirectory = async () => {
      if (authMode === 'api') {
        const result = await adminUsersApi.listUsersPage(
          { numeroDePagina: page, cantidadPorPagina: PAGE_SIZE },
          { signal: controller.signal },
        )
        if (!active) return
        setDirectory(result.items)
        setPageInfo({
          cantidadTotalDeItems: result.cantidadTotalDeItems,
          numeroDePagina: result.numeroDePagina,
          totalDePaginas: result.totalDePaginas,
        })
        setPymeUserIds(new Set())
        return
      }

      const nextUsers = await users.list({ signal: controller.signal })
      const accreditations = await Promise.all(
        nextUsers.map((user) =>
          pyme.getAccreditationByUser(user.id, { signal: controller.signal }),
        ),
      )
      if (!active) return
      setDirectory(nextUsers)
      setPageInfo(null)
      setPymeUserIds(
        new Set(
          accreditations
            .filter((item) => item?.estado === 'activa')
            .map((item) => item?.usuarioId)
            .filter((id): id is string => Boolean(id)),
        ),
      )
    }

    void loadDirectory()
      .catch((reason: unknown) => {
        if (!active || controller.signal.aborted) return
        if (reason instanceof ApiHttpError && reason.status === 401) {
          void signOut()
        }
        setError(
          authMode === 'api'
            ? getAdminApiErrorMessage(reason, 'usuario')
            : 'No se pudo cargar el directorio de usuarios demostrativo.',
        )
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
      controller.abort()
    }
  }, [authMode, page, pyme, signOut, users])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    return directory.filter((user) => {
      const matchesRole = role === 'todos' || user.rol === role
      const matchesText = !normalized || `${user.nombre} ${user.apellidos} ${user.correo} ${user.id}`.toLocaleLowerCase('es').includes(normalized)
      return matchesRole && matchesText
    })
  }, [directory, query, role])

  const count = (value: RolUsuario) => directory.filter((user) => user.rol === value).length
  const loadUserDetail = async (userId: string) => {
    setDetailUser(null)
    setDetailError(undefined)
    setDetailLoading(true)
    try {
      const user =
        authMode === 'api'
          ? await adminUsersApi.getUserById(userId)
          : await users.getById(userId)
      if (!user) throw new Error('No se encontró el usuario solicitado.')
      setDetailUser(user)
    } catch (reason) {
      if (reason instanceof ApiHttpError && reason.status === 401) {
        void signOut()
      }
      setDetailError(
        authMode === 'api'
          ? getAdminApiErrorMessage(reason, 'usuario')
          : 'No se pudo cargar el detalle demostrativo del usuario.',
      )
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div><h1 aria-label="Usuarios" className="dashboard-page-title">Gestión de Usuarios del Sistema</h1><p>Administración centralizada de compradores, vendedores y administradores.</p></div>
      </header>
      {authMode === 'api' ? (
        <Alert title="Acreditación PYME">El backend aún no ofrece datos de acreditación para mostrar en este directorio.</Alert>
      ) : (
        <Alert title="Modo de demostración">Los usuarios y estados PYME de esta vista son datos demostrativos, no información real del backend.</Alert>
      )}
      <div className="admin-kpis">
        <KpiCard label={pageInfo ? 'Total usuarios' : 'Total usuarios demo'} value={pageInfo?.cantidadTotalDeItems ?? directory.length} />
        <KpiCard label={pageInfo ? 'Compradores en página' : 'Compradores'} tone="success" value={count('comprador')} />
        <KpiCard label={pageInfo ? 'Vendedores en página' : 'Vendedores'} value={count('vendedor')} />
        <KpiCard label={pageInfo ? 'Administradores en página' : 'Administradores'} value={count('administrador')} />
      </div>
      <div className="admin-toolbar admin-toolbar--filters">
        <TextField label={authMode === 'api' ? 'Buscar en esta página' : 'Buscar usuario'} onChange={(event) => { setQuery(event.target.value); if (authMode === 'api' && page !== 1) { setLoading(true); setError(undefined); setPage(1) } }} placeholder="Nombre, correo o ID" type="search" value={query} />
        <label>Filtrar por rol en {authMode === 'api' ? 'esta página' : 'el directorio'}<select onChange={(event) => { setRole(event.target.value as RolUsuario | 'todos'); if (authMode === 'api' && page !== 1) { setLoading(true); setError(undefined); setPage(1) } }} value={role}><option value="todos">Todos los roles</option><option value="comprador">Compradores</option><option value="vendedor">Vendedores</option><option value="administrador">Administradores</option></select></label>
      </div>
      {loading && <Skeleton height="24rem" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        filtered.length === 0 ? (
          <EmptyState description={query || role !== 'todos' ? 'Prueba con otros términos o un rol diferente.' : 'No hay usuarios en esta página.'} title="No se encontraron usuarios" />
        ) : (
          <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Usuario</th><th>Correo electrónico</th><th>Rol</th><th>Estado</th><th>Fecha de creación</th><th>Acciones</th></tr></thead><tbody>
            {filtered.map((user) => <tr key={user.id}><td><strong>{user.nombre} {user.apellidos}</strong><small>{user.id}</small></td><td>{user.correo}</td><td><Badge variant={user.rol === 'administrador' ? 'neutral' : user.rol === 'vendedor' ? 'primary' : 'success'}>{user.rol}</Badge>{authMode === 'demo' && pymeUserIds.has(user.id) && <small className="admin-pyme-label">PYME activa · demo</small>}</td><td><Badge variant={user.activo ? 'success' : 'danger'}>{user.activo ? 'Activo' : 'Inactivo'}</Badge></td><td>{formatAdminDate(user.fechaCreacion)}</td><td><Button disabled={detailLoading} onClick={() => void loadUserDetail(user.id)} size="sm" variant="secondary">Ver detalle</Button></td></tr>)}
          </tbody></table></div>
        )
      )}
      {pageInfo && !loading && !error && (
        <div className="admin-toolbar" aria-label="Paginación de usuarios">
          <span>Página {pageInfo.numeroDePagina} de {pageInfo.totalDePaginas} · {pageInfo.cantidadTotalDeItems} usuarios</span>
          <div>
            <Button disabled={pageInfo.numeroDePagina <= 1} onClick={() => { setLoading(true); setError(undefined); setPage((current) => Math.max(1, current - 1)) }} variant="secondary">Anterior</Button>
            <Button disabled={pageInfo.numeroDePagina >= pageInfo.totalDePaginas} onClick={() => { setLoading(true); setError(undefined); setPage((current) => current + 1) }} variant="secondary">Siguiente</Button>
          </div>
        </div>
      )}
      <Modal onClose={() => { setDetailUser(null); setDetailError(undefined) }} open={detailLoading || Boolean(detailUser) || Boolean(detailError)} title="Detalle del usuario">
        {detailLoading && <Skeleton height="8rem" />}
        {detailError && <Alert variant="danger">{detailError}</Alert>}
        {detailUser && (
          <dl className="admin-description-list">
            <div><dt>Nombre</dt><dd>{detailUser.nombre} {detailUser.apellidos}</dd></div>
            <div><dt>ID</dt><dd>{detailUser.id}</dd></div>
            <div><dt>Correo</dt><dd>{detailUser.correo}</dd></div>
            <div><dt>Teléfono</dt><dd>{detailUser.telefono || '—'}</dd></div>
            <div><dt>Rol</dt><dd>{detailUser.rol}</dd></div>
            <div><dt>Estado</dt><dd>{detailUser.activo ? 'Activo' : 'Inactivo'}</dd></div>
            <div><dt>Fecha de creación</dt><dd>{formatAdminDate(detailUser.fechaCreacion)}</dd></div>
          </dl>
        )}
      </Modal>
    </section>
  )
}
