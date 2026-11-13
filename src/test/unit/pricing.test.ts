import { describe, expect, it } from 'vitest'
import {
  calculateCartTotals,
  calculateUnitPrice,
  isAccreditationValid,
  type AcreditacionPyme,
} from '../../domain'
import { acreditacionesPyme, productos } from '../../mocks/fixtures'

const referenceDate = new Date('2026-11-07T12:00:00.000-06:00')
const activeAccreditation = acreditacionesPyme[0]
const expiredAccreditation = acreditacionesPyme[1]
const keyboard = productos[0]
const mouse = productos[1]
const cartItems = [
  { product: keyboard, quantity: 1 },
  { product: mouse, quantity: 1 },
]

describe('domain pricing', () => {
  it('calcula el carrito regular en colones enteros', () => {
    expect(calculateCartTotals(cartItems, null, referenceDate)).toEqual({
      itemCount: 2,
      regularSubtotal: 61_800,
      savings: 0,
      total: 61_800,
    })
  })

  it('calcula total y ahorro PYME solo con acreditación activa y vigente', () => {
    expect(
      calculateCartTotals(cartItems, activeAccreditation, referenceDate),
    ).toEqual({
      itemCount: 2,
      regularSubtotal: 61_800,
      savings: 5_400,
      total: 56_400,
    })
    expect(
      calculateUnitPrice(keyboard, activeAccreditation, referenceDate),
    ).toBe(39_900)
  })

  it('no aplica PrecioPyme a solicitudes pendientes sin acreditación', () => {
    expect(calculateUnitPrice(keyboard, null, referenceDate)).toBe(42_900)
  })

  it.each([
    ['vencida', expiredAccreditation],
    [
      'revocada',
      { ...activeAccreditation, estado: 'revocada' } as AcreditacionPyme,
    ],
  ])('no aplica PrecioPyme con acreditación %s', (_label, accreditation) => {
    expect(calculateUnitPrice(keyboard, accreditation, referenceDate)).toBe(
      42_900,
    )
    expect(calculateCartTotals(cartItems, accreditation, referenceDate).total).toBe(
      61_800,
    )
  })

  it('considera inclusivas las fechas de inicio y vencimiento', () => {
    expect(
      isAccreditationValid(
        activeAccreditation,
        new Date(activeAccreditation.fechaInicio),
      ),
    ).toBe(true)
    expect(
      isAccreditationValid(
        activeAccreditation,
        new Date(activeAccreditation.fechaVencimiento),
      ),
    ).toBe(true)
  })

  it('rechaza fechas inválidas y cantidades no positivas', () => {
    expect(
      isAccreditationValid(
        { ...activeAccreditation, fechaVencimiento: 'fecha-inválida' },
        referenceDate,
      ),
    ).toBe(false)
    expect(() =>
      calculateCartTotals([{ product: keyboard, quantity: 0 }]),
    ).toThrow(RangeError)
  })
})
