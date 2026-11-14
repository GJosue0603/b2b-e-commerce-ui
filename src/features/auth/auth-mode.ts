export type AuthMode = 'api' | 'demo'

export function resolveAuthMode(
  value: string | undefined = import.meta.env.VITE_AUTH_MODE,
): AuthMode {
  if (!value || value === 'demo') return 'demo'
  if (value === 'api') return 'api'
  throw new Error(
    `VITE_AUTH_MODE debe ser "demo" o "api"; se recibió "${value}".`,
  )
}
