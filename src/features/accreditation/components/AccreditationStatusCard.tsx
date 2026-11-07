import { Link } from 'react-router-dom'
import { routePatterns } from '../../../app/router/paths'
import { Badge, type BadgeVariant } from '../../../shared/ui'
import type { AccreditationStatusModel } from '../usecases'
import { formatAccreditationDate } from './formatAccreditationDate'

export interface AccreditationStatusCardProps {
  readonly model: AccreditationStatusModel
}

const statusCopy: Record<
  AccreditationStatusModel['status'],
  {
    readonly description: string
    readonly label: string
    readonly title: string
    readonly variant: BadgeVariant
  }
> = {
  active: {
    description: 'La acreditación está activa y dentro de su período de vigencia.',
    label: 'Acreditación activa',
    title: 'PrecioPyme habilitado',
    variant: 'success',
  },
  expired: {
    description: 'La vigencia terminó. Los precios regulares vuelven a aplicarse.',
    label: 'Acreditación vencida',
    title: 'Acreditación vencida',
    variant: 'warning',
  },
  none: {
    description: 'Todavía no has presentado una solicitud de acreditación.',
    label: 'Sin acreditación',
    title: 'Solicita la acreditación cuando lo necesites',
    variant: 'neutral',
  },
  pending: {
    description: 'La solicitud espera revisión administrativa manual.',
    label: 'Solicitud pendiente',
    title: 'Solicitud en revisión',
    variant: 'primary',
  },
  rejected: {
    description: 'La solicitud no fue aprobada. Puedes corregirla y presentar otra.',
    label: 'Solicitud rechazada',
    title: 'Solicitud rechazada',
    variant: 'danger',
  },
  revoked: {
    description: 'La acreditación fue revocada y ya no concede precios preferenciales.',
    label: 'Acreditación revocada',
    title: 'Beneficio revocado',
    variant: 'danger',
  },
}

export function AccreditationStatusCard({
  model,
}: AccreditationStatusCardProps) {
  const copy = statusCopy[model.status]
  return (
    <section
      className={`accreditation-status-card accreditation-status-card--${model.status}`}
      data-benefits-enabled={model.benefitsEnabled}
    >
      <header>
        <Badge variant={copy.variant}>{copy.label}</Badge>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </header>

      {model.accreditation && (
        <dl className="accreditation-status-card__details">
          <div>
            <dt>Empresa</dt>
            <dd>{model.accreditation.solicitudPyme.nombreComercial}</dd>
          </div>
          <div>
            <dt>Inicio de vigencia</dt>
            <dd>{formatAccreditationDate(model.accreditation.fechaInicio)}</dd>
          </div>
          <div>
            <dt>Fin de vigencia</dt>
            <dd>{formatAccreditationDate(model.accreditation.fechaVencimiento)}</dd>
          </div>
        </dl>
      )}

      {model.request?.estado === 'pendiente' && (
        <p>
          Presentada el {formatAccreditationDate(model.request.fechaSolicitud)}.
        </p>
      )}
      {model.request?.estado === 'rechazada' && (
        <p className="accreditation-status-card__reason">
          Motivo: {model.request.motivoRechazo}
        </p>
      )}

      {model.benefitsEnabled && (
        <div className="accreditation-status-card__benefit">
          PrecioPyme se aplicará automáticamente en catálogo, carrito y checkout.
        </div>
      )}
      {(model.status === 'none' || model.status === 'rejected') && (
        <Link to={routePatterns.accreditationRequest}>
          {model.status === 'rejected' ? 'Nueva solicitud' : 'Iniciar solicitud'}
        </Link>
      )}
      {model.status === 'expired' && (
        <Link to={routePatterns.accreditationRequest}>Solicitar renovación</Link>
      )}
    </section>
  )
}
