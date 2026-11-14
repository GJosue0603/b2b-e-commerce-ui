import type { BuyerProfileInput } from '../../services'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[\d\s-]{8,20}$/

export interface RegistrationValues extends Omit<BuyerProfileInput, 'apellidos'> {
  readonly apellido1: string
  readonly apellido2: string
  readonly confirmPassword: string
  readonly password: string
}

export type RegistrationErrors = Partial<
  Record<keyof RegistrationValues, string>
>

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'El correo electrónico es obligatorio.'
  if (!EMAIL_PATTERN.test(email.trim())) return 'Ingresa un correo electrónico válido.'
  return undefined
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'La contraseña es obligatoria.'
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Usa al menos 8 caracteres, con letras y números.'
  }
  return undefined
}

export function validateBuyerProfile(
  values: BuyerProfileInput,
): Partial<Record<keyof BuyerProfileInput, string>> {
  return {
    apellidos: values.apellidos.trim() ? undefined : 'Los apellidos son obligatorios.',
    correo: validateEmail(values.correo),
    nombre: values.nombre.trim() ? undefined : 'El nombre es obligatorio.',
    telefono: PHONE_PATTERN.test(values.telefono.trim())
      ? undefined
      : 'Ingresa un teléfono válido.',
  }
}

export function validateRegistration(
  values: RegistrationValues,
): RegistrationErrors {
  const errors: RegistrationErrors = {
    apellido1: values.apellido1.trim()
      ? undefined
      : 'El primer apellido es obligatorio.',
    correo: validateEmail(values.correo),
    nombre: values.nombre.trim() ? undefined : 'El nombre es obligatorio.',
    telefono: PHONE_PATTERN.test(values.telefono.trim())
      ? undefined
      : 'Ingresa un teléfono válido.',
    password: validatePassword(values.password),
    confirmPassword:
      values.confirmPassword === values.password
        ? undefined
        : 'Las contraseñas no coinciden.',
  }
  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => Boolean(value)),
  ) as RegistrationErrors
}
