import type { AcreditacionPyme, MontoColones, Producto } from '../types'

export interface CartPricingItem {
  readonly product: Pick<Producto, 'precioPyme' | 'precioRegular'>
  readonly quantity: number
}

export interface CartTotals {
  readonly itemCount: number
  readonly regularSubtotal: MontoColones
  readonly savings: MontoColones
  readonly total: MontoColones
}

export function isAccreditationValid(
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

export function calculateUnitPrice(
  product: Pick<Producto, 'precioPyme' | 'precioRegular'>,
  accreditation?: AcreditacionPyme | null,
  referenceDate?: Date,
): MontoColones {
  return isAccreditationValid(accreditation, referenceDate)
    ? product.precioPyme
    : product.precioRegular
}

export function calculateCartTotals(
  items: readonly CartPricingItem[],
  accreditation?: AcreditacionPyme | null,
  referenceDate?: Date,
): CartTotals {
  return items.reduce<CartTotals>(
    (totals, { product, quantity }) => {
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new RangeError('La cantidad debe ser un entero mayor o igual a 1.')
      }

      const regularLineTotal = product.precioRegular * quantity
      const lineTotal =
        calculateUnitPrice(product, accreditation, referenceDate) * quantity

      return {
        itemCount: totals.itemCount + quantity,
        regularSubtotal: totals.regularSubtotal + regularLineTotal,
        savings: totals.savings + regularLineTotal - lineTotal,
        total: totals.total + lineTotal,
      }
    },
    { itemCount: 0, regularSubtotal: 0, savings: 0, total: 0 },
  )
}
