import { describe, expect, it } from 'vitest'
import { resolveCatalogDataMode } from './useCatalogReader'

describe('resolveCatalogDataMode', () => {
  it('selecciona el modo demo por defecto y permite configurar API', () => {
    expect(resolveCatalogDataMode(undefined)).toBe('demo')
    expect(resolveCatalogDataMode('demo')).toBe('demo')
    expect(resolveCatalogDataMode('api')).toBe('api')
  })

  it('rechaza valores desconocidos en vez de cambiar silenciosamente a mocks', () => {
    expect(() => resolveCatalogDataMode('remote')).toThrow(
      'VITE_CATALOG_DATA_MODE',
    )
  })
})
