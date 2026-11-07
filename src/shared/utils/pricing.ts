import type {
  AcreditacionPyme,
  MontoColones,
  Producto,
} from '../../domain'

const crcFormatter = new Intl.NumberFormat('es-CR', {
  currency: 'CRC',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function formatCRC(amount: MontoColones): string {
  return crcFormatter.format(amount)
}

export function hasActivePymeAccreditation(
  accreditation: AcreditacionPyme | null | undefined,
  referenceDate: Date = new Date(),
): boolean {
  if (accreditation?.estado !== 'activa') return false

  const startsAt = new Date(accreditation.fechaInicio).getTime()
  const expiresAt = new Date(accreditation.fechaVencimiento).getTime()
  const checkedAt = referenceDate.getTime()

  if ([startsAt, expiresAt, checkedAt].some(Number.isNaN)) return false
  return startsAt <= checkedAt && checkedAt <= expiresAt
}

export function getProductPriceForCustomer(
  product: Pick<Producto, 'precioPyme' | 'precioRegular'>,
  accreditation: AcreditacionPyme | null | undefined,
  referenceDate?: Date,
): MontoColones {
  return hasActivePymeAccreditation(accreditation, referenceDate)
    ? product.precioPyme
    : product.precioRegular
}
