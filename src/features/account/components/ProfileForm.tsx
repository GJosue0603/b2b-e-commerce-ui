import { useState, type FormEvent } from 'react'
import type { Usuario } from '../../../domain'
import type { BuyerProfileInput } from '../../../services'
import { Alert, Button, TextField } from '../../../shared/ui'
import { validateBuyerProfile } from '../../auth/validation'

export interface ProfileFormProps {
  readonly loading?: boolean
  readonly onSave: (input: BuyerProfileInput) => Promise<{
    readonly message: string
    readonly ok: boolean
  }>
  readonly user: Usuario
}

function profileFromUser(user: Usuario): BuyerProfileInput {
  return {
    apellidos: user.apellidos,
    correo: user.correo,
    nombre: user.nombre,
    telefono: user.telefono,
  }
}

export function ProfileForm({ loading = false, onSave, user }: ProfileFormProps) {
  const [values, setValues] = useState(() => profileFromUser(user))
  const [errors, setErrors] = useState<
    Partial<Record<keyof BuyerProfileInput, string>>
  >({})
  const [result, setResult] = useState<{ message: string; ok: boolean }>()

  const setValue = (field: keyof BuyerProfileInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateBuyerProfile(values)
    setErrors(nextErrors)
    setResult(undefined)
    if (Object.values(nextErrors).some(Boolean)) return
    setResult(await onSave(values))
  }

  return (
    <form className="profile-form" noValidate onSubmit={handleSubmit}>
      {result && (
        <Alert
          title={result.ok ? 'Datos actualizados' : 'No pudimos guardar'}
          variant={result.ok ? 'success' : 'danger'}
        >
          {result.ok ? 'Los cambios ya se reflejan en tu sesión demostrativa.' : result.message}
        </Alert>
      )}
      <div className="profile-form__row">
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
        required
        type="tel"
        value={values.telefono}
      />
      <Button loading={loading} type="submit">Guardar cambios</Button>
    </form>
  )
}
