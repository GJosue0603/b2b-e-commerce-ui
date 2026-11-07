import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { DemoScenarioId } from '../../../services'
import { renderTestApp } from '../../../test/renderApp'

const statusCases = [
  ['buyer-pyme-pending', 'Solicitud en revisión'],
  ['buyer-pyme-rejected', 'Solicitud rechazada'],
  ['buyer-pyme-active', 'PrecioPyme habilitado'],
  ['buyer-pyme-expired', 'Acreditación vencida'],
  ['buyer-pyme-revoked', 'Beneficio revocado'],
] as const satisfies readonly [DemoScenarioId, string][]

describe('AccreditationStatusPage', () => {
  it.each(statusCases)('presenta la variante %s', async (scenario, title) => {
    renderTestApp('/acreditacion/estado', scenario)

    expect(await screen.findByRole('heading', { name: title })).toBeVisible()
  })

  it('separa la solicitud aprobada de la acreditación activa', async () => {
    renderTestApp('/acreditacion/estado', 'buyer-pyme-active')

    await screen.findByRole('heading', { name: 'PrecioPyme habilitado' })
    expect(screen.getByText('Estado de solicitud')).toBeVisible()
    expect(screen.getByText('aprobada')).toBeVisible()
    expect(
      document.querySelector('[data-benefits-enabled="true"]'),
    ).toBeInTheDocument()
  })

  it('ofrece nueva solicitud tras rechazo y renovación tras vencimiento', async () => {
    const { unmount } = renderTestApp(
      '/acreditacion/estado',
      'buyer-pyme-rejected',
    )
    expect(
      await screen.findByRole('link', { name: 'Nueva solicitud' }),
    ).toHaveAttribute('href', '/acreditacion/solicitar')

    unmount()
    renderTestApp('/acreditacion/estado', 'buyer-pyme-expired')
    expect(
      await screen.findByRole('link', { name: 'Solicitar renovación' }),
    ).toHaveAttribute('href', '/acreditacion/solicitar')
  })

  it.each([
    ['buyer-pyme-pending', 'false'],
    ['buyer-pyme-rejected', 'false'],
    ['buyer-pyme-expired', 'false'],
    ['buyer-pyme-revoked', 'false'],
  ] as const)(
    'no habilita beneficios en %s',
    async (scenario, expected) => {
      renderTestApp('/acreditacion/estado', scenario)
      await waitFor(() =>
        expect(
          document.querySelector(`[data-benefits-enabled="${expected}"]`),
        ).toBeInTheDocument(),
      )
    },
  )
})
