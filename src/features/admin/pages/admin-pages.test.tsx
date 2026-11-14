import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderTestApp } from '../../../test/renderApp'

describe('panel administrativo', () => {
  it.each([
    ['/admin/acreditaciones', 'administrator', 'Solicitudes PYME', ['Cumplimiento normativo', 'Auditoría legal']],
    ['/admin/usuarios', 'administrator', 'Usuarios', ['Centro de control', 'Directorio interno']],
    ['/admin/pedidos', 'administrator', 'Pedidos', ['Módulo de supervisión exclusiva', 'Trazabilidad activa']],
    ['/admin/reportes', 'administrator', 'Análisis de ventas', ['Entorno de demostración']],
    ['/admin/acreditaciones/demo-solicitud-pyme-pendiente', 'administrator', 'Revisar solicitud PYME', ['Solicitud PYME · pendiente']],
  ] as const)(
    'muestra %s sin etiquetas sobre el título',
    async (path, scenario, heading, removedLabels) => {
      renderTestApp(path, scenario)

      expect(await screen.findByRole('heading', { name: heading })).toBeVisible()
      for (const label of removedLabels) {
        expect(screen.queryByText(label)).toBeNull()
      }
    },
  )

  it('lista solicitudes y abre un expediente sin recargar', async () => {
    const user = userEvent.setup()
    const { router } = renderTestApp('/admin/acreditaciones', 'administrator')

    expect(await screen.findByRole('heading', { name: 'Solicitudes PYME' })).toBeVisible()
    const links = await screen.findAllByRole('link', { name: 'Revisar' })
    const reviewLink = links[0]
    if (!reviewLink) throw new Error('No se encontró una solicitud pendiente.')
    await user.click(reviewLink)

    expect(await screen.findByRole('heading', { name: 'Revisar solicitud PYME' })).toBeVisible()
    expect(router.state.location.pathname).toContain('/admin/acreditaciones/')
  })

  it('registra un dictamen visual sin mutar el repositorio', async () => {
    const user = userEvent.setup()
    renderTestApp('/admin/acreditaciones/demo-solicitud-pyme-pendiente', 'administrator')

    await user.click(await screen.findByRole('button', { name: 'Aprobar solicitud' }))
    expect(await screen.findByText('Dictamen simulado registrado')).toBeVisible()
  })

  it('muestra el directorio demo de usuarios y marca la condición PYME como simulada', async () => {
    renderTestApp('/admin/usuarios', 'administrator')

    expect(await screen.findByRole('heading', { name: 'Usuarios' })).toBeVisible()
    expect(await screen.findByText('diego.pyme@nexotech.demo.test')).toBeVisible()
    expect(screen.getByText('PYME activa · demo')).toBeVisible()
  })

  it('deniega la ruta administrativa de categorías al Vendedor', async () => {
    renderTestApp('/admin/categorias', 'seller')

    expect(await screen.findByText('Acceso restringido')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Categorías de productos' })).toBeNull()
  })

  it('supervisa pedidos confirmados y sus referencias de pago', async () => {
    renderTestApp('/admin/pedidos', 'administrator')

    expect(await screen.findByRole('heading', { name: 'Pedidos' })).toBeVisible()
    expect(await screen.findByText('DEMO-PAY-PYME-001')).toBeVisible()
    expect(screen.getByText('₡56.400')).toBeVisible()
  })
})
