import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { AcreditacionPyme, SolicitudPyme } from '../../../domain'
import { useAppServices } from '../../../app/services'
import { Alert, Badge, Button, Skeleton } from '../../../shared/ui'
import type { AsyncState } from '../../../services'
import type { DemoScenarioId } from '../../../services'
import { useAuth } from '../../auth/state'
import { AccreditationHistory, AccreditationStatusCard } from '../components'
import { AccountTabs } from '../../account/components'
import {
  resolveAccreditationStatus,
  type AccreditationDisplayStatus,
} from '../usecases'
import './accreditation-page.css'

interface AccreditationData {
  readonly accreditations: readonly AcreditacionPyme[]
  readonly requests: readonly SolicitudPyme[]
}

type PreviewStatus = Exclude<AccreditationDisplayStatus, 'none'>

const previewOptions = [
  { id: 'pending', label: 'Pendiente', scenarioId: 'buyer-pyme-pending' },
  { id: 'rejected', label: 'Rechazada', scenarioId: 'buyer-pyme-rejected' },
  { id: 'active', label: 'Activa', scenarioId: 'buyer-pyme-active' },
  { id: 'expired', label: 'Vencida', scenarioId: 'buyer-pyme-expired' },
  { id: 'revoked', label: 'Revocada', scenarioId: 'buyer-pyme-revoked' },
] as const satisfies readonly {
  readonly id: PreviewStatus
  readonly label: string
  readonly scenarioId: DemoScenarioId
}[]

export function AccreditationStatusPage() {
  const location = useLocation()
  const { demoSession, pyme } = useAppServices()
  const { user } = useAuth()
  const [state, setState] = useState<AsyncState<AccreditationData>>({
    status: 'loading',
  })
  const submitted = Boolean(
    (location.state as { submittedRequestId?: string } | null)
      ?.submittedRequestId,
  )

  const load = useCallback(async () => {
    if (!user) return
    setState({ status: 'loading' })
    try {
      const [requests, accreditations] = await Promise.all([
        pyme.listRequestsByUser(user.id),
        pyme.getAccreditationsByUser(user.id),
      ])
      setState({ status: 'success', data: { accreditations, requests } })
    } catch (reason) {
      setState({
        status: 'error',
        error:
          reason instanceof Error
            ? reason
            : new Error('No fue posible consultar la acreditación.'),
      })
    }
  }, [pyme, user])

  const preview = async (status: PreviewStatus) => {
    const option = previewOptions.find((item) => item.id === status)
    if (!option) return
    setState({ status: 'loading' })
    try {
      const session = await demoSession.getByScenario(option.scenarioId)
      if (!session.user) throw new Error('El escenario no tiene comprador.')
      const [requests, accreditations] = await Promise.all([
        pyme.listRequestsByUser(session.user.id),
        pyme.getAccreditationsByUser(session.user.id),
      ])
      setState({ status: 'success', data: { accreditations, requests } })
    } catch (reason) {
      setState({
        status: 'error',
        error:
          reason instanceof Error
            ? reason
            : new Error('No fue posible cargar la vista demostrativa.'),
      })
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  return (
    <div className="container accreditation-page accreditation-status-page">
      <AccountTabs />
      <header className="accreditation-page__header">
        <Badge variant="primary">Área del Comprador</Badge>
        <h1>Mi acreditación PYME o MicroPYME</h1>
        <p>
          Consulta por separado el trámite administrativo y la vigencia del
          beneficio comercial.
        </p>
      </header>
      {submitted && (
        <Alert title="Solicitud registrada" variant="success">
          Se guardó como Pendiente en los datos demostrativos. Todavía no activa
          PrecioPyme.
        </Alert>
      )}
      {state.status === 'loading' && (
        <Skeleton label="Consultando acreditación" lines={5} />
      )}
      {state.status === 'error' && (
        <Alert title="No pudimos consultar el estado" variant="danger">
          <p>{state.error.message}</p>
          <Button onClick={() => void load()} size="sm" variant="secondary">
            Reintentar
          </Button>
        </Alert>
      )}
      {state.status === 'success' && (
        <AccreditationContent data={state.data} onPreview={preview} />
      )}
    </div>
  )
}

function AccreditationContent({
  data,
  onPreview,
}: {
  readonly data: AccreditationData
  readonly onPreview: (status: PreviewStatus) => Promise<void>
}) {
  const model = resolveAccreditationStatus(
    data.requests,
    data.accreditations,
  )

  return (
    <>
      {import.meta.env.DEV && (
        <section className="accreditation-preview" aria-label="Vista demostrativa">
          <div>
            <strong>Vista demostrativa de acreditación</strong>
            <small>
              Cambia la presentación sin modificar la sesión del Comprador.
            </small>
          </div>
          <div aria-label="Estados de acreditación" role="group">
            {previewOptions.map((option) => (
              <button
                aria-pressed={model.status === option.id}
                key={option.id}
                onClick={() => void onPreview(option.id)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="accreditation-status-summary">
        <AccreditationStatusCard model={model} />
        <aside className="accreditation-card accreditation-benefits">
          <h2>Beneficios del Programa PYME</h2>
          <ul>
            <li>Precios preferenciales aplicados automáticamente.</li>
            <li>Facturación electrónica para efectos fiscales.</li>
            <li>Línea de soporte técnico dedicada.</li>
          </ul>
          <Alert title="Requisitos de vigencia">Mantén actualizada la documentación legal para conservar el beneficio.</Alert>
        </aside>
      </div>
      <AccreditationHistory requests={data.requests} />
    </>
  )
}
