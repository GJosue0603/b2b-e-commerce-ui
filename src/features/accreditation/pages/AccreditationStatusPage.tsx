import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { AcreditacionPyme, SolicitudPyme } from '../../../domain'
import { useAppServices } from '../../../app/services'
import { Alert, Badge, Button, Skeleton } from '../../../shared/ui'
import type { AsyncState } from '../../../services'
import { useAuth } from '../../auth/state'
import { AccreditationHistory, AccreditationStatusCard } from '../components'
import { resolveAccreditationStatus } from '../usecases'
import './accreditation-page.css'

interface AccreditationData {
  readonly accreditations: readonly AcreditacionPyme[]
  readonly requests: readonly SolicitudPyme[]
}

export function AccreditationStatusPage() {
  const location = useLocation()
  const { pyme } = useAppServices()
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

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  return (
    <div className="container accreditation-page accreditation-status-page">
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
        <>
          <AccreditationStatusCard
            model={resolveAccreditationStatus(
              state.data.requests,
              state.data.accreditations,
            )}
          />
          <AccreditationHistory requests={state.data.requests} />
        </>
      )}
    </div>
  )
}
