import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderTestApp } from '../../../test/renderApp'

describe('MyOrdersPage', () => {
  it('muestra solo el pedido confirmado del usuario y su pago aprobado', async () => {
    const user = userEvent.setup()
    renderTestApp('/mis-pedidos', 'buyer-regular')
    const list = await screen.findByRole('region', { name: 'Pedidos confirmados' })
    expect(within(list).getAllByText(/demo-pedido-regular/i)).toHaveLength(1)
    expect(document.body.textContent).not.toContain('DEMO-PAY-RECHAZADO-001')
    expect(document.body.textContent).not.toContain('DEMO-PAY-CANCELADO-001')

    await user.click(within(list).getByText(/demo-pedido-regular/i))
    expect(screen.getByText('DEMO-PAY-REGULAR-001')).toBeVisible()
    expect(screen.getByText('1 × ₡42.900')).toBeVisible()
  })

  it('muestra estado vacío para un comprador sin pedidos', async () => {
    renderTestApp('/mis-pedidos', 'buyer-pyme-expired')
    expect(
      await screen.findByRole('heading', {
        name: 'Todavía no tienes pedidos confirmados',
      }),
    ).toBeVisible()
  })

  it('no mezcla pedidos entre compradores', async () => {
    renderTestApp('/mis-pedidos', 'buyer-pyme-active')
    const list = await screen.findByRole('region', { name: 'Pedidos confirmados' })
    expect(within(list).getByText(/demo-pedido-pyme/i)).toBeVisible()
    expect(within(list).queryByText(/demo-pedido-regular/i)).toBeNull()
  })
})
