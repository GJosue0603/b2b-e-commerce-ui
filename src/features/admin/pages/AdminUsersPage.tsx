import { useEffect, useMemo, useState } from 'react'
import { useAppServices } from '../../../app/services'
import type { RolUsuario, Usuario } from '../../../domain'
import { Alert, Badge, KpiCard, Skeleton, TextField } from '../../../shared/ui'
import { formatAdminDate } from './admin-utils'
import './admin-pages.css'

export function AdminUsersPage() {
  const { pyme, users } = useAppServices()
  const [directory, setDirectory] = useState<readonly Usuario[]>([])
  const [pymeUserIds, setPymeUserIds] = useState<ReadonlySet<string>>(new Set())
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<RolUsuario | 'todos'>('todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let active = true
    void users.list()
      .then(async (nextUsers) => {
        const accreditations = await Promise.all(
          nextUsers.map((user) => pyme.getAccreditationByUser(user.id)),
        )
        if (!active) return
        setDirectory(nextUsers)
        setPymeUserIds(new Set(accreditations.filter((item) => item?.estado === 'activa').map((item) => item?.usuarioId).filter((id): id is string => Boolean(id))))
      })
      .catch(() => active && setError('No se pudo cargar el directorio de usuarios.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [pyme, users])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    return directory.filter((user) => {
      const matchesRole = role === 'todos' || user.rol === role
      const matchesText = !normalized || `${user.nombre} ${user.apellidos} ${user.correo} ${user.id}`.toLocaleLowerCase('es').includes(normalized)
      return matchesRole && matchesText
    })
  }, [directory, query, role])

  const count = (value: RolUsuario) => directory.filter((user) => user.rol === value).length

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div><span>Centro de control</span><h1 aria-label="Usuarios">Gestión de Usuarios del Sistema</h1><p>Administración centralizada de compradores, vendedores y administradores.</p></div>
        <Badge variant="primary">Directorio interno</Badge>
      </header>
      <Alert title="Aclaración del modelo de identidad">PYME es una condición comercial asociada a una cuenta Comprador, no un rol independiente.</Alert>
      <div className="admin-kpis">
        <KpiCard label="Total usuarios" value={directory.length} />
        <KpiCard label="Compradores" tone="success" value={count('comprador')} />
        <KpiCard label="Vendedores" value={count('vendedor')} />
        <KpiCard label="Administradores" value={count('administrador')} />
      </div>
      <div className="admin-toolbar admin-toolbar--filters">
        <TextField label="Buscar usuario" onChange={(event) => setQuery(event.target.value)} placeholder="Nombre, correo o ID" type="search" value={query} />
        <label>Filtrar por rol<select onChange={(event) => setRole(event.target.value as RolUsuario | 'todos')} value={role}><option value="todos">Todos los roles</option><option value="comprador">Compradores</option><option value="vendedor">Vendedores</option><option value="administrador">Administradores</option></select></label>
      </div>
      {loading && <Skeleton height="24rem" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Usuario</th><th>Correo electrónico</th><th>Rol</th><th>Estado</th><th>Fecha de creación</th></tr></thead><tbody>
          {filtered.map((user) => <tr key={user.id}><td><strong>{user.nombre} {user.apellidos}</strong><small>{user.id}</small></td><td>{user.correo}</td><td><Badge variant={user.rol === 'administrador' ? 'neutral' : user.rol === 'vendedor' ? 'primary' : 'success'}>{user.rol}</Badge>{pymeUserIds.has(user.id) && <small className="admin-pyme-label">PYME activa</small>}</td><td><Badge variant={user.activo ? 'success' : 'danger'}>{user.activo ? 'Activo' : 'Inactivo'}</Badge></td><td>{formatAdminDate(user.fechaCreacion)}</td></tr>)}
        </tbody></table></div>
      )}
    </section>
  )
}
