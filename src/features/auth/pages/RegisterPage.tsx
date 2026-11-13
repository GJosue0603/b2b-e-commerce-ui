import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { routePatterns } from '../../../app/router/paths'
import { Alert, Button, TextField } from '../../../shared/ui'
import { useAuth } from '../state'
import {
  validateRegistration,
  type RegistrationErrors,
  type RegistrationValues,
} from '../validation'
import './auth-pages.css'

const initialValues: RegistrationValues = {
  apellidos: '',
  confirmPassword: '',
  correo: '',
  nombre: '',
  password: '',
  telefono: '',
}

export function RegisterPage() {
  const { actionStatus, register } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<RegistrationErrors>({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsError, setTermsError] = useState<string>()
  const [result, setResult] = useState<{ ok: boolean; message: string }>()

  const setValue = (field: keyof RegistrationValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateRegistration(values)
    const nextTermsError = acceptedTerms
      ? undefined
      : 'Debes aceptar los términos para crear la cuenta.'
    setErrors(nextErrors)
    setTermsError(nextTermsError)
    setResult(undefined)
    if (Object.keys(nextErrors).length > 0 || nextTermsError) return

    const response = await register({
      apellidos: values.apellidos.trim(),
      correo: values.correo.trim(),
      nombre: values.nombre.trim(),
      telefono: values.telefono.trim(),
    })
    setResult(response)
    if (response.ok) {
      setValues(initialValues)
      setAcceptedTerms(false)
    }
  }

  return (
    <div className="auth-page auth-page--register">
      <Alert title="Cuenta Comprador" variant="info">
        Toda cuenta inicia como Comprador. Podrás solicitar el beneficio de
        Acreditación PYME posteriormente desde tu perfil.
      </Alert>
      <header className="auth-page__header">
        <h1>Crear cuenta</h1>
        <p>Acceso completo al catálogo, compras, pedidos y facturación.</p>
      </header>
      {result && (
        <Alert
          title={result.ok ? 'Cuenta creada con éxito' : 'No pudimos crear la cuenta'}
          variant={result.ok ? 'success' : 'danger'}
        >
          {result.ok ? (
            <span>
              Ya puedes comprar o consultar <Link to={routePatterns.account}>Mi cuenta</Link>.
            </span>
          ) : (
            result.message
          )}
        </Alert>
      )}
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <div className="auth-form__row">
          <TextField
            autoComplete="given-name"
            error={errors.nombre}
            label="Nombre"
            onChange={(event) => setValue('nombre', event.target.value)}
            required
            value={values.nombre}
          />
          <TextField
            autoComplete="family-name"
            error={errors.apellidos}
            label="Apellidos"
            onChange={(event) => setValue('apellidos', event.target.value)}
            required
            value={values.apellidos}
          />
        </div>
        <TextField
          autoComplete="email"
          error={errors.correo}
          label="Correo electrónico"
          onChange={(event) => setValue('correo', event.target.value)}
          required
          type="email"
          value={values.correo}
        />
        <TextField
          autoComplete="tel"
          error={errors.telefono}
          label="Teléfono"
          onChange={(event) => setValue('telefono', event.target.value)}
          placeholder="+506 8888-8888"
          required
          type="tel"
          value={values.telefono}
        />
        <div className="auth-form__row">
          <TextField
            autoComplete="new-password"
            error={errors.password}
            hint="Mínimo 8 caracteres, letras y números."
            label="Contraseña"
            onChange={(event) => setValue('password', event.target.value)}
            required
            type="password"
            value={values.password}
          />
          <TextField
            autoComplete="new-password"
            error={errors.confirmPassword}
            label="Confirmar contraseña"
            onChange={(event) => setValue('confirmPassword', event.target.value)}
            required
            type="password"
            value={values.confirmPassword}
          />
        </div>
        <label className="auth-form__checkbox">
          <input
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            type="checkbox"
          />
          <span>Acepto los términos y la política de privacidad de la demo.</span>
        </label>
        {termsError && <span className="auth-form__error" role="alert">{termsError}</span>}
        <Button
          fullWidth
          loading={actionStatus === 'loading'}
          size="lg"
          type="submit"
        >
          Crear cuenta
        </Button>
      </form>
      <p className="auth-page__switch">
        ¿Ya tienes una cuenta? <Link to={routePatterns.signIn}>Iniciar sesión</Link>
      </p>
    </div>
  )
}
