import { useState, type FormEvent } from 'react'
import { Button, FileUpload, Select, TextField } from '../../../shared/ui'

export interface AccreditationRequestValues {
  readonly actividadEconomica: string
  readonly documentos: readonly File[]
  readonly identificacionNegocio: string
  readonly nombreComercial: string
}

export interface AccreditationRequestFormProps {
  readonly loading?: boolean
  readonly onSubmit: (values: AccreditationRequestValues) => Promise<void> | void
  readonly submitError?: string
}

type FieldErrors = Partial<
  Record<keyof AccreditationRequestValues | 'declaration', string>
>

const economicActivities = [
  'Comercio',
  'Manufactura',
  'Servicios profesionales',
  'Servicios tecnológicos',
  'Otra actividad',
] as const

export function AccreditationRequestForm({
  loading = false,
  onSubmit,
  submitError,
}: AccreditationRequestFormProps) {
  const [nombreComercial, setNombreComercial] = useState('')
  const [identificacionNegocio, setIdentificacionNegocio] = useState('')
  const [actividadEconomica, setActividadEconomica] = useState('')
  const [documentos, setDocumentos] = useState<readonly File[]>([])
  const [declarationAccepted, setDeclarationAccepted] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = {
      actividadEconomica: actividadEconomica.trim(),
      documentos,
      identificacionNegocio: identificacionNegocio.trim(),
      nombreComercial: nombreComercial.trim(),
    }
    const nextErrors: FieldErrors = {}
    if (!values.nombreComercial) nextErrors.nombreComercial = 'Ingresa el nombre comercial.'
    if (!values.identificacionNegocio) {
      nextErrors.identificacionNegocio = 'Ingresa la identificación del negocio.'
    }
    if (!values.actividadEconomica) {
      nextErrors.actividadEconomica = 'Selecciona la actividad económica.'
    }
    if (values.documentos.length === 0) {
      nextErrors.documentos = 'Adjunta al menos un documento de respaldo.'
    }
    if (!declarationAccepted) {
      nextErrors.declaration = 'Debes aceptar la declaración para continuar.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) void onSubmit(values)
  }

  return (
    <form className="accreditation-request-form" noValidate onSubmit={handleSubmit}>
      <div className="accreditation-request-form__row">
        <TextField
          autoComplete="organization"
          disabled={loading}
          error={errors.nombreComercial}
          label="Nombre comercial"
          onChange={(event) => setNombreComercial(event.currentTarget.value)}
          required
          value={nombreComercial}
        />
        <TextField
          disabled={loading}
          error={errors.identificacionNegocio}
          hint="Cédula jurídica, identificación tributaria o registro equivalente."
          label="Identificación del negocio"
          onChange={(event) => setIdentificacionNegocio(event.currentTarget.value)}
          required
          value={identificacionNegocio}
        />
      </div>
      <Select
        disabled={loading}
        error={errors.actividadEconomica}
        label="Actividad económica"
        onChange={(event) => setActividadEconomica(event.currentTarget.value)}
        required
        value={actividadEconomica}
      >
        <option value="">Selecciona una actividad</option>
        {economicActivities.map((activity) => (
          <option key={activity} value={activity}>{activity}</option>
        ))}
      </Select>
      <FileUpload
        disabled={loading}
        error={errors.documentos}
        files={documentos}
        label="Documentos de respaldo"
        onChange={setDocumentos}
        required
      />
      <label className="accreditation-request-form__declaration">
        <input
          aria-describedby={errors.declaration ? 'accreditation-declaration-error' : undefined}
          aria-invalid={Boolean(errors.declaration) || undefined}
          checked={declarationAccepted}
          disabled={loading}
          onChange={(event) => setDeclarationAccepted(event.currentTarget.checked)}
          required
          type="checkbox"
        />
        <span>
          Declaro que los datos suministrados son demostrativos y autorizo su
          revisión dentro de esta simulación.
        </span>
      </label>
      {errors.declaration && (
        <small
          className="ui-field__error"
          id="accreditation-declaration-error"
        >
          {errors.declaration}
        </small>
      )}
      {submitError && <p className="accreditation-request-form__error" role="alert">{submitError}</p>}
      <Button loading={loading} size="lg" type="submit">
        Enviar solicitud de acreditación
      </Button>
    </form>
  )
}
