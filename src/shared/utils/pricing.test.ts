import { describe, expect, it } from 'vitest'
import { formatCRC } from './pricing'

describe('pricing', () => {
  it('formatea CRC con agrupación por puntos y sin decimales', () => {
    expect(formatCRC(42_900)).toBe('₡42.900')
  })
})
