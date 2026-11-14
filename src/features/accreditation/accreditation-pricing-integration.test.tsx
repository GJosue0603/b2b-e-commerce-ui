import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { DemoScenarioId } from '../../services'
import { renderTestApp } from '../../test/renderApp'

afterEach(cleanup)

describe('vigencia PYME integrada', () => {
  it.each([
    'buyer-pyme-expired',
    'buyer-pyme-revoked',
  ] as const satisfies readonly DemoScenarioId[])(
    'usa precio regular en catálogo para %s',
    async (scenario) => {
      renderTestApp('/catalogo', scenario)
      await screen.findByRole('heading', { name: 'Catálogo de Tecnología' })
      await screen.findByText('₡42.900')

      expect(screen.queryByText('Precio PYME')).toBeNull()
      expect(document.body.textContent).toContain('₡42.900')
    },
  )

  it.each([
    'buyer-pyme-expired',
    'buyer-pyme-revoked',
  ] as const satisfies readonly DemoScenarioId[])(
    'usa precio regular en detalle para %s',
    async (scenario) => {
      renderTestApp('/producto/demo-producto-teclado-mecanico', scenario)
      await screen.findByRole('heading', { name: 'Teclado mecánico inalámbrico' })

      expect(screen.queryByText('Precio PYME')).toBeNull()
      expect(document.body.textContent).toContain('₡42.900')
    },
  )

  it.each([
    ['/carrito', 'Tu carrito'],
    ['/checkout', 'Revisar y pagar'],
  ] as const)(
    'recalcula ₡61.800 sin ahorro en %s para acreditación revocada',
    async (path, heading) => {
      renderTestApp(path, 'buyer-pyme-revoked')
      await screen.findByRole('heading', { name: heading })

      expect(document.body.textContent).toContain('₡61.800')
      expect(screen.queryByText('Ahorro PYME')).toBeNull()
    },
  )
})
