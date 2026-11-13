import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { RolUsuario } from '../../../domain'
import { routePatterns } from '../../../app/router/paths'
import { Alert, Button, TextField } from '../../../shared/ui'
import { useAuth } from '../state'
import { validateEmail, validatePassword } from '../validation'
import { useDemoAccessProfiles } from '../hooks/useDemoAccessProfiles'
import './auth-pages.css'

function landingPath(role: RolUsuario): string {
  if (role === 'administrador') return routePatterns.adminRoot
  if (role === 'vendedor') return routePatterns.sellerRoot
  return routePatterns.account
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { actionStatus, signIn } = useAuth()
  const accessProfiles = useDemoAccessProfiles()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [message, setMessage] = useState<string>()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    }
    setErrors(nextErrors)
    setMessage(undefined)
    if (nextErrors.email || nextErrors.password) return

    const result = await signIn(email, password)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    const requestedPath = (location.state as { from?: string } | null)?.from
    navigate(requestedPath ?? landingPath(result.user?.rol ?? 'comprador'), {
      replace: true,
    })
  }

  return (
    <div className="auth-page">
      <header className="auth-page__header">
        <span>Portal de clientes</span>
        <h1>Iniciar sesión</h1>
        <p>Accede a tus compras, pedidos y datos de cuenta.</p>
      </header>
      {message && (
        <Alert title="No pudimos iniciar la sesión" variant="danger">
          {message}
        </Alert>
      )}
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <TextField
          autoComplete="email"
          error={errors.email}
          label="Correo electrónico"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ejemplo@dominio.com"
          required
          type="email"
          value={email}
        />
        <TextField
          autoComplete="current-password"
          error={errors.password}
          hint="Credencial exclusiva de la demo; no se guarda en la cuenta ni en el navegador."
          label="Contraseña"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <div className="auth-form__options">
          <label className="auth-form__checkbox">
            <input type="checkbox" />
            <span>Recordar mis datos en este dispositivo</span>
          </label>
          <span>Acceso seguro</span>
        </div>
        <Button
          fullWidth
          loading={actionStatus === 'loading'}
          size="lg"
          type="submit"
        >
          Ingresar
        </Button>
      </form>
      {accessProfiles.status === 'success' && (
        <details className="demo-access-list">
          <summary>Ver credenciales de demostración</summary>
          <div>
            {accessProfiles.data.map((profile) => (
              <button
                key={profile.scenarioId}
                onClick={() => {
                  setEmail(profile.email)
                  setPassword(profile.password)
                  setErrors({})
                  setMessage(undefined)
                }}
                type="button"
              >
                <strong>{profile.label}</strong>
                <span>{profile.email}</span>
                <code>{profile.password}</code>
              </button>
            ))}
          </div>
        </details>
      )}
      <p className="auth-page__switch">
        ¿Aún no tienes una cuenta? <Link to={routePatterns.signUp}>Crear cuenta</Link>
      </p>
      <p className="auth-page__security">♢ Acceso seguro con cifrado TLS. NexoTech no comparte tus credenciales.</p>
    </div>
  )
}
