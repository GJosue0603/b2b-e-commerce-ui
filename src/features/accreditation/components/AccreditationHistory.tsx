import type { SolicitudPyme } from '../../../domain'
import { Badge, type BadgeVariant } from '../../../shared/ui'
import { formatAccreditationDate } from './formatAccreditationDate'

export interface AccreditationHistoryProps {
  readonly requests: readonly SolicitudPyme[]
}

const requestVariants: Record<SolicitudPyme['estado'], BadgeVariant> = {
  aprobada: 'success',
  pendiente: 'primary',
  rechazada: 'danger',
}

export function AccreditationHistory({ requests }: AccreditationHistoryProps) {
  return (
    <section className="accreditation-history" aria-labelledby="history-title">
      <h2 id="history-title">Historial de solicitudes</h2>
      {requests.length === 0 ? (
        <p>No hay solicitudes registradas.</p>
      ) : (
        <div className="accreditation-history__scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Expediente</th>
                <th scope="col">Fecha</th>
                <th scope="col">Empresa</th>
                <th scope="col">Estado de solicitud</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{formatAccreditationDate(request.fechaSolicitud)}</td>
                  <td>{request.nombreComercial}</td>
                  <td>
                    <Badge variant={requestVariants[request.estado]}>
                      {request.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
