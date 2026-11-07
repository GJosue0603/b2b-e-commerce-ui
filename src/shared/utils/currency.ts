import type { MontoColones } from '../../domain'

const colonesFormatter = new Intl.NumberFormat('es-CR', {
  currency: 'CRC',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function formatColones(amount: MontoColones): string {
  return colonesFormatter.format(amount)
}
