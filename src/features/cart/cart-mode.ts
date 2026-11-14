export type CartDataMode = 'api' | 'demo'

export function resolveCartDataMode(
  value: string | undefined = import.meta.env.VITE_CART_DATA_MODE,
): CartDataMode {
  if (!value || value === 'demo') return 'demo'
  if (value === 'api') return 'api'
  throw new Error(
    `VITE_CART_DATA_MODE debe ser "demo" o "api"; se recibió "${value}".`,
  )
}
