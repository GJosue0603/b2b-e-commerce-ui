import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderTestApp } from '../../../test/renderApp'

const statusCases = [
  ['Pendiente', 'Solicitud en revisión'],
  ['Rechazada', 'Solicitud rechazada'],
  ['Activa', 'PrecioPyme habilitado'],
  ['Vencida', 'Acreditación vencida'],
  ['Revocada', 'Beneficio revocado'],
] as const

describe('AccreditationStatusPage', () => {
  it.each(statusCases)('presenta la variante %s desde sus tabs', async (tab, title) => {
    const user = userEvent.setup()
    renderTestApp('/acreditacion/estado', 'buyer-pyme-active')

    await user.click(await screen.findByRole('button', { name: tab }))
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
    const user = userEvent.setup()
    renderTestApp('/acreditacion/estado', 'buyer-pyme-active')
    await user.click(await screen.findByRole('button', { name: 'Rechazada' }))
    expect(
      await screen.findByRole('link', { name: 'Nueva solicitud' }),
    ).toHaveAttribute('href', '/acreditacion/solicitar')

    await user.click(await screen.findByRole('button', { name: 'Vencida' }))
    expect(
      await screen.findByRole('link', { name: 'Solicitar renovación' }),
    ).toHaveAttribute('href', '/acreditacion/solicitar')
  })

  it.each([
    ['Pendiente', 'false'],
    ['Rechazada', 'false'],
    ['Vencida', 'false'],
    ['Revocada', 'false'],
  ] as const)(
    'no habilita beneficios en el tab %s',
    async (tab, expected) => {
      const user = userEvent.setup()
      renderTestApp('/acreditacion/estado', 'buyer-pyme-active')
      await user.click(await screen.findByRole('button', { name: tab }))
      await waitFor(() =>
        expect(
          document.querySelector(`[data-benefits-enabled="${expected}"]`),
        ).toBeInTheDocument(),
      )
    },
  )
})
