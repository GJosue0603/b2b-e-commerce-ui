import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderTestApp } from '../../../test/renderApp'

describe('CheckoutPage', () => {
  it('revisa identidad, artículos y total regular desde el carrito compartido', async () => {
    renderTestApp('/checkout', 'buyer-regular')

    expect(
      await screen.findByRole('heading', { name: 'Revisar y pagar' }),
    ).toBeVisible()
    expect(screen.getByText('Camila Rojas Mora')).toBeVisible()
    expect(screen.getByText('Artículos a comprar (2)')).toBeVisible()
    expect(screen.getByText('Subtotal regular (2)')).toBeVisible()
    expect(document.body.textContent).toContain('₡61.800')
    expect(screen.queryByText('Ahorro PYME')).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Continuar al pago simulado' }),
    ).toHaveAttribute('href', '/pago/resultado?resultado=aprobado')
    expect(screen.queryByLabelText(/número de tarjeta/i)).toBeNull()
    expect(screen.queryByLabelText(/cvv/i)).toBeNull()
  })

  it('aplica únicamente el precio PYME de una acreditación activa y vigente', async () => {
    renderTestApp('/checkout', 'buyer-pyme-active')

    await screen.findByRole('heading', { name: 'Revisar y pagar' })
    expect(screen.getByText('Ahorro PYME')).toBeVisible()
    expect(document.body.textContent).toContain('₡61.800')
    expect(document.body.textContent).toContain('−₡5.400')
    expect(document.body.textContent).toContain('₡56.400')
  })

  it('redirige a iniciar sesión cuando el visitante abre checkout', async () => {
    const { router } = renderTestApp('/checkout')

    expect(
      await screen.findByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/ingresar')
  })

  it('muestra estado vacío y desactiva continuar sin artículos', async () => {
    renderTestApp('/checkout', 'buyer-pyme-pending')

    expect(
      await screen.findByRole('heading', {
        name: 'No hay artículos para revisar',
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Continuar al pago simulado' }),
    ).toBeDisabled()
  })
})
