import { describe, expect, it } from 'vitest'
import {
  acreditacionesPyme,
  solicitudPymePendiente,
  solicitudPymeRechazada,
} from '../../../mocks/fixtures'
import { resolveAccreditationStatus } from './resolveAccreditationStatus'

describe('resolveAccreditationStatus', () => {
  it('no confunde una solicitud pendiente con una acreditación', () => {
    const result = resolveAccreditationStatus([solicitudPymePendiente], [])

    expect(result.status).toBe('pending')
    expect(result.accreditation).toBeNull()
    expect(result.benefitsEnabled).toBe(false)
  })

  it('resuelve rechazada, activa, vencida y revocada por separado', () => {
    expect(resolveAccreditationStatus([solicitudPymeRechazada], []).status).toBe(
      'rejected',
    )
    expect(
      resolveAccreditationStatus(
        [acreditacionesPyme[0]!.solicitudPyme],
        [acreditacionesPyme[0]!],
        new Date('2026-11-07T12:00:00-06:00'),
      ).status,
    ).toBe('active')
    expect(
      resolveAccreditationStatus(
        [acreditacionesPyme[1]!.solicitudPyme],
        [acreditacionesPyme[1]!],
      ).status,
    ).toBe('expired')
    expect(
      resolveAccreditationStatus(
        [acreditacionesPyme[2]!.solicitudPyme],
        [acreditacionesPyme[2]!],
      ).status,
    ).toBe('revoked')
  })
})
