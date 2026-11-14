import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { routePatterns } from '../../../app/router/paths'
import { useAppServices } from '../../../app/services'
import { useDemoSession } from '../../../app/demoSession'
import { Alert, Badge } from '../../../shared/ui'
import {
  AccreditationRequestForm,
  type AccreditationRequestValues,
} from '../components'
import { useAuth } from '../../auth/state'
import './accreditation-page.css'

export function AccreditationRequestPage() {
  const navigate = useNavigate()
  const { pyme } = useAppServices()
  const { retry } = useDemoSession()
  const { authMode, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const submitRequest = async (values: AccreditationRequestValues) => {
    if (!user || authMode === 'api') return
    setLoading(true)
    setSubmitError('')
    try {
      const request = await pyme.submitRequest({
        actividadEconomica: values.actividadEconomica,
        documentos: values.documentos.map(
          (file) => `local-demo://${encodeURIComponent(file.name)}`,
        ),
        identificacionNegocio: values.identificacionNegocio,
        nombreComercial: values.nombreComercial,
        usuarioId: user.id,
      })
      await retry()
      navigate(routePatterns.accreditationStatus, {
        replace: true,
        state: { submittedRequestId: request.id },
      })
    } catch (reason) {
      setSubmitError(
        reason instanceof Error
          ? reason.message
          : 'No fue posible registrar la solicitud demostrativa.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (authMode === 'api') {
    return (
      <div className="container accreditation-page">
        <header className="accreditation-page__header">
          <h1>Solicitar acreditación PYME o MicroPYME</h1>
        </header>
        <Alert title="Acreditación solo demostrativa" variant="info">
          El backend aún no tiene endpoints de acreditación. No se mostrarán ni
          guardarán solicitudes simuladas junto a una sesión API.
        </Alert>
      </div>
    )
  }

  return (
    <div className="container accreditation-page">
      <ol className="accreditation-steps" aria-label="Progreso de acreditación">
        <li className="accreditation-steps__current"><span>1</span><div><small>Paso actual</small><strong>Completar solicitud</strong></div></li>
        <li><span>2</span><div><small>Siguiente fase</small><strong>Revisión administrativa</strong></div></li>
        <li><span>3</span><div><small>Fase final</small><strong>Resultado y dictamen</strong></div></li>
      </ol>
      <header className="accreditation-page__header">
        <Badge variant="success">Canal de calificación comercial corporativa</Badge>
        <h1>Solicitar acreditación PYME o MicroPYME</h1>
        <p>
          Accede a tarifas y condiciones comerciales preferenciales para tu negocio.
          La solicitud requiere revisión administrativa.
        </p>
      </header>
      <Alert title="Importante" variant="info">
        Enviar una solicitud no habilita inmediatamente PrecioPyme. Los archivos
        no se cargan a servicios externos.
      </Alert>
      <Alert title="Modo de demostración">
        La solicitud se guarda solo en el repositorio local de mocks; el backend
        aún no ofrece este endpoint.
      </Alert>
      <div className="accreditation-page__layout">
        <section className="accreditation-card" aria-labelledby="request-form-title">
          <h2 id="request-form-title">Datos de la Razón Social y Operación</h2>
          <AccreditationRequestForm
            loading={loading}
            onSubmit={submitRequest}
            submitError={submitError}
          />
        </section>
        <aside className="accreditation-card accreditation-card--aside">
          <Badge variant="neutral">Estado de cuenta: Regular</Badge>
          <h2>¿Cómo funciona?</h2>
          <ol>
            <li>Envías información y referencias locales de documentos.</li>
            <li>Un Administrador realizará la revisión en una etapa posterior.</li>
            <li>Solo una aprobación genera acreditación temporal.</li>
          </ol>
          <p className="accreditation-privacy">Los documentos se procesan únicamente para validar la solicitud y no se comparten con terceros.</p>
          <Link to={routePatterns.account}>Cancelar y volver a Mi cuenta</Link>
        </aside>
      </div>
    </div>
  )
}
