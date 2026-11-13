import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderTestApp } from '../../../test/renderApp'

describe('AccreditationRequestPage', () => {
  it('presenta validación accesible para todos los datos obligatorios', async () => {
    const user = userEvent.setup()
    renderTestApp('/acreditacion/solicitar', 'buyer-regular')

    await user.click(
      await screen.findByRole('button', {
        name: 'Enviar solicitud de acreditación',
      }),
    )

    expect(screen.getByText('Ingresa el nombre comercial.')).toBeVisible()
    expect(
      screen.getByText('Ingresa la identificación del negocio.'),
    ).toBeVisible()
    expect(screen.getByText('Selecciona la actividad económica.')).toBeVisible()
    expect(
      screen.getByText('Adjunta al menos un documento de respaldo.'),
    ).toBeVisible()
    expect(
      screen.getByText('Debes aceptar la declaración para continuar.'),
    ).toBeVisible()
  })

  it('lista el documento local y valida un formulario completo', async () => {
    const user = userEvent.setup()
    const { router, services } = renderTestApp(
      '/acreditacion/solicitar',
      'buyer-regular',
    )
    await screen.findByRole('heading', {
      name: 'Solicitar acreditación PYME o MicroPYME',
    })

    await user.type(screen.getByLabelText(/Nombre comercial/), 'Nexo Café')
    await user.type(
      screen.getByLabelText(/Identificación del negocio/),
      '3-101-999999',
    )
    await user.selectOptions(
      screen.getByLabelText(/Actividad económica/),
      'Comercio',
    )
    await user.upload(
      screen.getByLabelText(/Documentos de respaldo/),
      new File(['demo'], 'personeria.pdf', { type: 'application/pdf' }),
    )
    await user.click(screen.getByRole('checkbox'))
    await user.click(
      screen.getByRole('button', { name: 'Enviar solicitud de acreditación' }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Mi acreditación PYME o MicroPYME',
      }),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/acreditacion/estado')
    await expect(
      services.pyme.getRequestByUser('demo-usuario-comprador-regular'),
    ).resolves.toMatchObject({
      estado: 'pendiente',
      documentos: ['local-demo://personeria.pdf'],
      nombreComercial: 'Nexo Café',
    })
  })
})
