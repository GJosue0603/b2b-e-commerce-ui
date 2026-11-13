import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { paths } from '../../../app/router/paths'
import { useAppServices } from '../../../app/services'
import type { SolicitudPyme, Usuario } from '../../../domain'
import { Alert, Badge, KpiCard, Skeleton, TextField } from '../../../shared/ui'
import { formatAdminDate } from './admin-utils'
import './admin-pages.css'

interface AccreditationRow {
  readonly request: SolicitudPyme
  readonly user?: Usuario
}

export function AdminAccreditationsPage() {
  const { pyme, users } = useAppServices()
  const [rows, setRows] = useState<readonly AccreditationRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let active = true
    void Promise.all([pyme.listRequests(), users.list()])
      .then(([requests, directory]) => {
        if (!active) return
        const usersById = new Map(directory.map((user) => [user.id, user]))
        setRows(requests.map((request) => ({ request, user: usersById.get(request.usuarioId) })))
      })
      .catch(() => active && setError('No se pudo cargar el registro de solicitudes.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [pyme, users])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    if (!normalized) return rows
    return rows.filter(({ request, user }) =>
      `${request.id} ${request.nombreComercial} ${user?.nombre ?? ''} ${user?.apellidos ?? ''}`
        .toLocaleLowerCase('es')
        .includes(normalized),
    )
  }, [query, rows])

  const count = (status: SolicitudPyme['estado']) => rows.filter(({ request }) => request.estado === status).length

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <span>Cumplimiento normativo</span>
          <h1 aria-label="Solicitudes PYME">Solicitudes de acreditación PYME</h1>
          <p>Revisión y dictamen manual de documentación legal para habilitación de tarifas B2B.</p>
        </div>
        <Badge variant="primary">Auditoría legal</Badge>
      </header>

      <div className="admin-kpis">
        <KpiCard label="Pendientes de revisión" tone="warning" value={count('pendiente')} />
        <KpiCard label="Solicitudes aprobadas" tone="success" value={count('aprobada')} />
        <KpiCard label="Solicitudes rechazadas" value={count('rechazada')} />
        <KpiCard label="Tiempo promedio" value="18.4 h" />
      </div>

      <div className="admin-toolbar">
        <TextField label="Buscar expediente" onChange={(event) => setQuery(event.target.value)} placeholder="Razón social, solicitante o expediente" type="search" value={query} />
        <span>{filtered.length} expedientes visibles</span>
      </div>

      {loading && <Skeleton height="24rem" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>Expediente / Solicitante</th><th>Empresa</th><th>Fecha</th><th>Documentación</th><th>Estado</th><th>Dictamen</th></tr></thead>
            <tbody>
              {filtered.map(({ request, user }) => (
                <tr key={request.id}>
                  <td><Link to={paths.adminAccreditationDetail(request.id)}>{request.id}</Link><small>{user ? `${user.nombre} ${user.apellidos}` : 'Comprador'}</small></td>
                  <td><strong>{request.nombreComercial}</strong><small>{request.identificacionNegocio}</small></td>
                  <td>{formatAdminDate(request.fechaSolicitud)}</td>
                  <td>{request.documentos.length} archivo(s)</td>
                  <td><StatusBadge status={request.estado} /></td>
                  <td><Link className="admin-table__action" to={paths.adminAccreditationDetail(request.id)}>{request.estado === 'pendiente' ? 'Revisar' : 'Ver ficha'}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Alert title="Gobernanza de cumplimiento">Los datos de esta vista son demostrativos y mantienen trazabilidad visual de cada expediente.</Alert>
    </section>
  )
}

function StatusBadge({ status }: { readonly status: SolicitudPyme['estado'] }) {
  return <Badge variant={status === 'aprobada' ? 'success' : status === 'rechazada' ? 'danger' : 'warning'}>{status}</Badge>
}
