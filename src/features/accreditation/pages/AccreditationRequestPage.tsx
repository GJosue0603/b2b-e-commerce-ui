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
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const submitRequest = async (values: AccreditationRequestValues) => {
    if (!user) return
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

  return (
    <div className="container accreditation-page">
      <header className="accreditation-page__header">
        <Badge variant="success">Solicitud demostrativa</Badge>
        <h1>Solicitar acreditación PYME o MicroPYME</h1>
        <p>
          Completa la información del negocio. La acreditación requiere revisión
          administrativa y no cambia tu rol Comprador.
        </p>
      </header>
      <Alert title="Importante" variant="info">
        Enviar una solicitud no habilita inmediatamente PrecioPyme. Los archivos
        no se cargan a servicios externos.
      </Alert>
      <div className="accreditation-page__layout">
        <section className="accreditation-card" aria-labelledby="request-form-title">
          <h2 id="request-form-title">Datos del negocio</h2>
          <AccreditationRequestForm
            loading={loading}
            onSubmit={submitRequest}
            submitError={submitError}
          />
        </section>
        <aside className="accreditation-card accreditation-card--aside">
          <h2>¿Cómo funciona?</h2>
          <ol>
            <li>Envías información y referencias locales de documentos.</li>
            <li>Un Administrador realizará la revisión en una etapa posterior.</li>
            <li>Solo una aprobación genera acreditación temporal.</li>
          </ol>
          <Link to={routePatterns.account}>Cancelar y volver a Mi cuenta</Link>
        </aside>
      </div>
    </div>
  )
}
