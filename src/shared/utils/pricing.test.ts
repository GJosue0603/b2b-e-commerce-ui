import { describe, expect, it } from 'vitest'
import type { AcreditacionPyme } from '../../domain'
import { formatCRC, hasActivePymeAccreditation } from './pricing'

const accreditation = {
  id: 'acreditacion-prueba',
  usuarioId: 'usuario-prueba',
  solicitudPyme: {
    id: 'solicitud-prueba',
    usuarioId: 'usuario-prueba',
    nombreComercial: 'Negocio de prueba',
    identificacionNegocio: 'TEST-001',
    actividadEconomica: 'Pruebas',
    documentos: [],
    estado: 'aprobada',
    fechaSolicitud: '2026-01-01T00:00:00.000Z',
    revisadoPor: { id: 'admin-prueba', nombre: 'Admin Prueba' },
    fechaRevision: '2026-01-02T00:00:00.000Z',
  },
  fechaInicio: '2026-01-01T00:00:00.000Z',
  fechaVencimiento: '2026-12-31T23:59:59.000Z',
  estado: 'activa',
} as const satisfies AcreditacionPyme

describe('pricing', () => {
  it('formatea CRC sin decimales', () => {
    expect(formatCRC(42_900)).toContain('42')
    expect(formatCRC(42_900)).toContain('900')
    expect(formatCRC(42_900)).toContain('₡')
  })

  it('considera inclusivos el inicio y el vencimiento', () => {
    expect(
      hasActivePymeAccreditation(
        accreditation,
        new Date(accreditation.fechaInicio),
      ),
    ).toBe(true)
    expect(
      hasActivePymeAccreditation(
        accreditation,
        new Date(accreditation.fechaVencimiento),
      ),
    ).toBe(true)
  })

  it('rechaza fechas inválidas', () => {
    expect(
      hasActivePymeAccreditation(
        { ...accreditation, fechaVencimiento: 'fecha-inválida' },
        new Date('2026-06-01T00:00:00.000Z'),
      ),
    ).toBe(false)
  })
})
