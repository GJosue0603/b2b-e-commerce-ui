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
  apellido1: '',
  apellido2: '',
  confirmPassword: '',
  correo: '',
  nombre: '',
  password: '',
  telefono: '',
}

export function RegisterPage() {
  const {
    actionStatus,
    authMode,
    register,
    resendVerificationCode,
    verifyEmail,
  } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<RegistrationErrors>({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsError, setTermsError] = useState<string>()
  const [result, setResult] = useState<{ ok: boolean; message: string }>()
  const [pendingEmail, setPendingEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationResult, setVerificationResult] =
    useState<{ ok: boolean; message: string }>()
  const [isVerified, setIsVerified] = useState(false)

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
      apellido1: values.apellido1.trim(),
      apellido2: values.apellido2.trim(),
      correo: values.correo.trim(),
      nombre: values.nombre.trim(),
      password: values.password,
      telefono: values.telefono.trim(),
    })
    setResult(response)
    if (response.ok) {
      if (authMode === 'api') setPendingEmail(values.correo.trim())
      setValues(initialValues)
      setAcceptedTerms(false)
    }
  }

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setVerificationResult(undefined)
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setVerificationResult({
        message: 'Ingresa el código de seis dígitos enviado a tu correo.',
        ok: false,
      })
      return
    }

    const response = await verifyEmail(pendingEmail, verificationCode)
    setVerificationResult(response)
    if (response.ok) setIsVerified(true)
  }

  const handleResend = async () => {
    setVerificationResult(undefined)
    setVerificationResult(await resendVerificationCode(pendingEmail))
  }

  return (
    <div className="auth-page auth-page--register">
      <Alert title="Cuenta Comprador" variant="info">
        Toda cuenta inicia como Comprador. Podrás solicitar el beneficio de
        Acreditación PYME posteriormente desde tu perfil.
      </Alert>
      <header className="auth-page__header">
        <h1>{pendingEmail ? 'Verificar correo' : 'Crear cuenta'}</h1>
        <p>
          {pendingEmail
            ? 'Completa la verificación para habilitar tu cuenta.'
            : 'Acceso completo al catálogo, compras, pedidos y facturación.'}
        </p>
      </header>
      {result && (
        <Alert
          title={
            result.ok
              ? authMode === 'api'
                ? 'Registro recibido'
                : 'Cuenta creada con éxito'
              : 'No pudimos crear la cuenta'
          }
          variant={result.ok ? 'success' : 'danger'}
        >
          {result.ok ? (
            authMode === 'api'
              ? result.message
              : <span>Ya puedes comprar o consultar <Link to={routePatterns.account}>Mi cuenta</Link>.</span>
          ) : (
            result.message
          )}
        </Alert>
      )}
      {pendingEmail && isVerified ? (
        <Alert title="Correo verificado" variant="success">
          <p>Ahora inicia sesión para acceder a tu cuenta.</p>
          <Link to={routePatterns.signIn}>Ir a iniciar sesión</Link>
        </Alert>
      ) : pendingEmail ? (
        <>
          <Alert title="Revisa tu correo" variant="info">
            Ingresa el código de seis dígitos enviado a {pendingEmail}. El
            registro no inicia sesión automáticamente.
          </Alert>
          {verificationResult && (
            <Alert
              title={
                verificationResult.ok
                  ? 'Verificación completada'
                  : 'No pudimos verificar el correo'
              }
              variant={verificationResult.ok ? 'success' : 'danger'}
            >
              {verificationResult.message}
            </Alert>
          )}
          <form className="auth-form" noValidate onSubmit={handleVerify}>
            <TextField
              autoComplete="one-time-code"
              error={
                verificationResult?.ok === false &&
                verificationResult.message.startsWith('Ingresa')
                  ? verificationResult.message
                  : undefined
              }
              label="Código de verificación"
              onChange={(event) => setVerificationCode(event.target.value)}
              required
              value={verificationCode}
            />
            <Button
              fullWidth
              loading={actionStatus === 'loading'}
              size="lg"
              type="submit"
            >
              Verificar correo
            </Button>
            <Button
              fullWidth
              disabled={actionStatus === 'loading'}
              onClick={() => void handleResend()}
              type="button"
              variant="secondary"
            >
              Reenviar código
            </Button>
          </form>
        </>
      ) : (
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
            error={errors.apellido1}
            label="Primer apellido"
            onChange={(event) => setValue('apellido1', event.target.value)}
            required
            value={values.apellido1}
          />
        </div>
        <TextField
          autoComplete="family-name"
          error={errors.apellido2}
          label="Segundo apellido (opcional)"
          onChange={(event) => setValue('apellido2', event.target.value)}
          value={values.apellido2}
        />
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
      )}
      <p className="auth-page__switch">
        ¿Ya tienes una cuenta? <Link to={routePatterns.signIn}>Iniciar sesión</Link>
      </p>
    </div>
  )
}
