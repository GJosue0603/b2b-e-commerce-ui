import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { routePatterns } from '../../../app/router/paths'
import { useAppServices } from '../../../app/services'
import type { SolicitudPyme, Usuario } from '../../../domain'
import { Alert, Badge, Button, EmptyState, Skeleton } from '../../../shared/ui'
import { formatAdminDate } from './admin-utils'
import './admin-pages.css'

export function AdminAccreditationDetailPage() {
  const { requestId } = useParams()
  const { pyme, users } = useAppServices()
  const [request, setRequest] = useState<SolicitudPyme>()
  const [buyer, setBuyer] = useState<Usuario>()
  const [loading, setLoading] = useState(true)
  const [decision, setDecision] = useState<'approved' | 'rejected'>()

  useEffect(() => {
    let active = true
    void Promise.all([pyme.listRequests(), users.list()]).then(([requests, directory]) => {
      if (!active) return
      const found = requests.find((item) => item.id === requestId)
      setRequest(found)
      setBuyer(directory.find((user) => user.id === found?.usuarioId))
      setLoading(false)
    })
    return () => { active = false }
  }, [pyme, requestId, users])

  if (loading) return <Skeleton height="30rem" />
  if (!request) return <EmptyState action={<Link to={routePatterns.adminAccreditations}>Volver a solicitudes</Link>} description="La solicitud indicada no existe en los datos demostrativos." title="Expediente no encontrado" />

  return (
    <section className="admin-page">
      <header className="admin-page__header admin-page__header--detail">
        <div>
          <h1 aria-label="Revisar solicitud PYME">Expediente #{request.id}</h1>
          <p>Solicitante: {buyer ? `${buyer.nombre} ${buyer.apellidos}` : 'Comprador'} · Radicado: {formatAdminDate(request.fechaSolicitud)}</p>
        </div>
        <Badge variant={request.estado === 'aprobada' ? 'success' : request.estado === 'rechazada' ? 'danger' : 'warning'}>{request.estado}</Badge>
      </header>

      {decision && <Alert title="Dictamen simulado registrado" variant={decision === 'approved' ? 'success' : 'warning'}>La decisión se mantiene únicamente en esta vista hasta que el backend exponga la operación administrativa.</Alert>}

      <div className="admin-detail-layout">
        <div className="admin-detail-main">
          <section className="admin-panel">
            <header><h2>Datos de la Empresa y Razón Social</h2><Badge variant="success">Identidad verificada</Badge></header>
            <dl className="admin-description-list">
              <div><dt>Nombre comercial</dt><dd>{request.nombreComercial}</dd></div>
              <div><dt>Identificación del negocio</dt><dd>{request.identificacionNegocio}</dd></div>
              <div><dt>Actividad económica</dt><dd>{request.actividadEconomica}</dd></div>
              <div><dt>Correo del solicitante</dt><dd>{buyer?.correo ?? 'No disponible'}</dd></div>
            </dl>
          </section>
          <section className="admin-panel">
            <header><h2>Documentos de Respaldo</h2><span>{request.documentos.length} archivo(s)</span></header>
            <ul className="admin-documents">
              {request.documentos.map((document) => <li key={document}><span>▣</span><div><strong>{document.split('/').at(-1)}</strong><small>Documento demostrativo para cotejo manual</small></div><Button size="sm" variant="secondary">Previsualizar</Button></li>)}
            </ul>
          </section>
        </div>
        <aside className="admin-panel admin-decision-panel">
          <h2>Decisión administrativa</h2>
          <p>Registra un dictamen visual para esta solicitud. La persistencia definitiva corresponde al backend.</p>
          <label>Fecha de inicio<input type="date" defaultValue="2026-11-12" /></label>
          <label>Fecha de vencimiento<input type="date" defaultValue="2027-11-12" /></label>
          <label>Beneficio comercial<select defaultValue="standard"><option value="standard">Tarifa PYME estándar</option><option value="plus">Tarifa PYME Plus</option></select></label>
          <Button onClick={() => setDecision('approved')} variant="primary">Aprobar solicitud</Button>
          <Button onClick={() => setDecision('rejected')} variant="danger">Rechazar solicitud</Button>
        </aside>
      </div>
    </section>
  )
}
