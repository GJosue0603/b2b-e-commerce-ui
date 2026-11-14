import type { MontoColones } from '../../domain'

export function formatCRC(amount: MontoColones): string {
  const roundedAmount = Math.round(amount)
  const sign = roundedAmount < 0 ? '-' : ''
  const groupedAmount = Math.abs(roundedAmount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sign}₡${groupedAmount}`
}
