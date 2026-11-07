import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderTestApp } from '../../../test/renderApp'

describe('autenticación demostrativa', () => {
  it('valida y crea únicamente una cuenta Comprador sin persistir contraseña', async () => {
    const user = userEvent.setup()
    const { services } = renderTestApp('/registro')
    await screen.findByRole('heading', { name: 'Crear cuenta' })

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText('El nombre es obligatorio.')).toBeVisible()

    await user.type(screen.getByLabelText(/Nombre/), 'Lucía')
    await user.type(screen.getByLabelText(/Apellidos/), 'Vargas Mora')
    await user.type(screen.getByLabelText(/Correo electrónico/), 'lucia@example.test')
    await user.type(screen.getByLabelText(/Teléfono/), '+506 8888-7777')
    await user.type(screen.getByLabelText(/^Contraseña/), 'Clave1234')
    await user.type(screen.getByLabelText(/Confirmar contraseña/), 'Clave1234')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Cuenta creada con éxito')).toBeVisible()
    const created = await services.users.getByEmail('lucia@example.test')
    expect(created?.rol).toBe('comprador')
    expect(created).not.toHaveProperty('password')
    expect(screen.queryByLabelText(/rol/i)).toBeNull()
  })

  it('muestra error para un correo no registrado y permite ingresar al comprador demo', async () => {
    const user = userEvent.setup()
    const { router } = renderTestApp('/ingresar')
    await screen.findByRole('heading', { name: 'Iniciar sesión' })

    await user.type(screen.getByLabelText(/Correo electrónico/), 'nadie@example.test')
    await user.type(screen.getByLabelText(/Contraseña/), 'Clave1234')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText(/credenciales demostrativas/i)).toBeVisible()

    await user.clear(screen.getByLabelText(/Correo electrónico/))
    await user.type(
      screen.getByLabelText(/Correo electrónico/),
      'camila.regular@nexotech.demo.test',
    )
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeVisible()
    expect(router.state.location.pathname).toBe('/mi-cuenta')
  })
})
