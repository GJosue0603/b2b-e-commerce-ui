import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { fixtureIds } from '../../../mocks/fixtures'
import { renderTestApp } from '../../../test/renderApp'

describe('AccountPage', () => {
  it('edita el usuario actual sin modificar otro comprador', async () => {
    const user = userEvent.setup()
    const { services } = renderTestApp('/mi-cuenta', 'buyer-regular')
    const name = await screen.findByLabelText(/Nombre/)
    expect(name).toHaveValue('Camila')

    await user.clear(name)
    await user.type(name, 'Camila Editada')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Datos actualizados')).toBeVisible()
    expect(name).toHaveValue('Camila Editada')
    expect(
      (await services.users.getById(fixtureIds.users.buyerRegular))?.nombre,
    ).toBe('Camila Editada')
    expect(
      (await services.users.getById(fixtureIds.users.buyerPymeActive))?.nombre,
    ).toBe('Diego')
    expect(
      screen.getByRole('link', { name: 'Ver estado de acreditación' }),
    ).toHaveAttribute('href', '/acreditacion/estado')
  })
})
