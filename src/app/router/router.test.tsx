import { cleanup, render, screen, within } from '@testing-library/react'
import {
  createMemoryRouter,
  RouterProvider,
  type InitialEntry,
} from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createMockServices } from '../../mocks/repositories'
import { CartProvider } from '../../features/cart/state'
import { AuthProvider } from '../../features/auth/state'
import type { DemoScenarioId } from '../../services'
import { DemoSessionProvider } from '../demoSession'
import { AppServicesProvider } from '../services'
import { routeDefinitions } from './routes'

function renderRoute(
  initialEntry: InitialEntry,
  initialScenarioId: DemoScenarioId = 'visitor',
) {
  const router = createMemoryRouter(routeDefinitions, {
    initialEntries: [initialEntry],
  })

  render(
    <AppServicesProvider services={createMockServices({ latencyMs: 0 })}>
      <DemoSessionProvider initialScenarioId={initialScenarioId}>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </DemoSessionProvider>
    </AppServicesProvider>,
  )
  return router
}

const routeCases = [
  ['/', 'Tecnología para tu día a día y tu negocio', 'visitor'],
  ['/catalogo', 'Catálogo de Tecnología', 'visitor'],
  ['/producto/demo-producto-teclado-mecanico', 'Teclado mecánico inalámbrico', 'visitor'],
  ['/carrito', 'Tu carrito', 'visitor'],
  ['/checkout', 'Revisar y pagar', 'buyer-regular'],
  ['/pago/resultado', 'Compra demostrativa confirmada', 'buyer-regular'],
  ['/ingresar', 'Iniciar sesión', 'visitor'],
  ['/registro', 'Crear cuenta', 'visitor'],
  ['/mi-cuenta', 'Mi cuenta', 'buyer-regular'],
  ['/mis-pedidos', 'Mis pedidos', 'buyer-regular'],
  ['/acreditacion/solicitar', 'Solicitar acreditación PYME o MicroPYME', 'buyer-regular'],
  ['/acreditacion/estado', 'Mi acreditación PYME o MicroPYME', 'buyer-regular'],
  ['/vendedor/productos', 'Productos e inventario', 'seller'],
  ['/vendedor/productos/nuevo', 'Nuevo producto', 'seller'],
  ['/vendedor/productos/demo-producto-teclado-mecanico/editar', 'Editar: Teclado mecánico inalámbrico', 'seller'],
  ['/vendedor/categorias', 'Categorías de productos', 'seller'],
  ['/vendedor/reportes', 'Análisis de ventas', 'seller'],
  ['/admin/acreditaciones', 'Solicitudes PYME', 'administrator'],
  ['/admin/acreditaciones/demo-solicitud-pyme-pendiente', 'Revisar solicitud PYME', 'administrator'],
  ['/admin/usuarios', 'Usuarios', 'administrator'],
  ['/admin/productos', 'Supervisión de productos', 'administrator'],
  ['/admin/pedidos', 'Pedidos', 'administrator'],
  ['/admin/reportes', 'Análisis de ventas', 'administrator'],
] as const

describe('mapa de rutas', () => {
  it.each(routeCases)('renderiza %s sin romper la pantalla', async (path, title, scenario) => {
    renderRoute(path, scenario)

    expect(
      await screen.findByRole('heading', { level: 1, name: title }),
    ).toBeVisible()
  })

  it('redirige las raíces internas a la primera opción permitida', async () => {
    const sellerRouter = renderRoute('/vendedor', 'seller')
    await screen.findByRole('heading', { name: 'Productos e inventario' })
    expect(sellerRouter.state.location.pathname).toBe('/vendedor/productos')
  })

  it('muestra únicamente las opciones del Vendedor', async () => {
    renderRoute('/vendedor/productos', 'seller')
    const navigation = await screen.findByRole('navigation', {
      name: 'Navegación de Vendedor',
    })

    expect(within(navigation).getByRole('link', { name: 'Productos' })).toBeVisible()
    expect(within(navigation).getByRole('link', { name: 'Categorías' })).toBeVisible()
    expect(within(navigation).getByRole('link', { name: 'Reportes' })).toBeVisible()
    expect(within(navigation).queryByRole('link', { name: 'Pedidos' })).toBeNull()
    expect(
      within(navigation).queryByRole('link', { name: 'Solicitudes PYME' }),
    ).toBeNull()
  })

  it('muestra únicamente las opciones del Administrador', async () => {
    renderRoute('/admin/acreditaciones', 'administrator')
    const navigation = await screen.findByRole('navigation', {
      name: 'Navegación de Administrador',
    })

    expect(
      within(navigation).getByRole('link', { name: 'Solicitudes PYME' }),
    ).toBeVisible()
    expect(within(navigation).getByRole('link', { name: 'Pedidos' })).toBeVisible()
    expect(within(navigation).queryByRole('link', { name: 'Categorías' })).toBeNull()
  })

  it.each([
    [
      '/vendedor/productos',
      'seller',
      'Vendedor',
      'vendedor@nexotech.demo.test',
      '/vendedor/cuenta',
    ],
    [
      '/admin/usuarios',
      'administrator',
      'Administrador',
      'admin@nexotech.demo.test',
      '/admin/cuenta',
    ],
  ] as const)(
    'usa el navbar compartido y muestra la cuenta de %s',
    async (path, scenario, roleLabel, email, accountPath) => {
      const user = userEvent.setup()
      const router = renderRoute(path, scenario)
      const brandLink = await screen.findByRole('link', { name: 'NexoTech' })
      const header = brandLink.closest('header')
      if (!header) throw new Error('No se encontró el navbar del dashboard.')

      expect(
        within(header).getByRole('link', { name: 'NexoTech' }),
      ).toHaveAttribute('href', '/')

      const accountMenu = await within(header).findByLabelText(
        `Cuenta de ${roleLabel}`,
      )
      expect(accountMenu).toHaveClass('header-action--icon-only')
      expect(accountMenu).not.toHaveTextContent(roleLabel)
      const accountDetails = accountMenu.closest('details')
      if (!accountDetails) throw new Error('No se encontró el menú de cuenta.')
      await user.click(accountMenu)
      const viewAccountLink = within(accountDetails).getByRole('link', {
        name: 'Ver cuenta',
      })
      expect(viewAccountLink).toHaveAttribute('href', accountPath)
      expect(within(accountDetails).queryByText(email)).toBeNull()
      await user.click(viewAccountLink)

      expect(
        await screen.findByRole('heading', { name: 'Mi cuenta' }),
      ).toBeVisible()
      expect(screen.getByLabelText(/Correo electrónico/)).toHaveValue(email)
      expect(
        screen.getByRole('heading', { name: 'Datos Personales y de Contacto' }),
      ).toBeVisible()
      expect(
        screen.getByRole('button', { name: 'Guardar cambios' }),
      ).toBeVisible()

      const profileName = screen.getByLabelText(/Nombre/)
      await user.clear(profileName)
      await user.type(profileName, `${roleLabel} Editado`)
      await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
      expect(await screen.findByText('Datos actualizados')).toBeVisible()
      expect(profileName).toHaveValue(`${roleLabel} Editado`)
      expect(router.state.location.pathname).toBe(accountPath)

      const profileMenu = await screen.findByLabelText(`Cuenta de ${roleLabel}`)
      const profileDetails = profileMenu.closest('details')
      if (!profileDetails) throw new Error('No se encontró el menú de cuenta.')
      await user.click(
        within(profileDetails).getByRole('button', { name: 'Cerrar sesión' }),
      )
      await screen.findByRole('heading', { name: 'Iniciar sesión' })
      expect(router.state.location.pathname).toBe('/ingresar')
    },
  )

  it('distingue la navegación pública de la experiencia Comprador', async () => {
    renderRoute('/catalogo')
    expect(
      screen.getAllByRole('link', { name: 'Ingresar' }).length,
    ).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: 'Mi cuenta' })).toBeNull()

    cleanup()
    renderRoute('/mi-cuenta', 'buyer-regular')
    expect(
      await screen.findByLabelText('Mi cuenta'),
    ).toBeVisible()
    expect(screen.getAllByRole('link', { name: 'Mis pedidos' }).length).toBeGreaterThan(0)
  })

  it('redirige al visitante que intenta abrir Mi cuenta', async () => {
    const router = renderRoute('/mi-cuenta')
    expect(
      await screen.findByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/ingresar')
  })

  it('impide visualmente que Vendedor acceda a rutas de Administrador', async () => {
    renderRoute('/admin/acreditaciones', 'seller')
    expect(await screen.findByText('Acceso restringido')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Solicitudes PYME' })).toBeNull()
  })

  it('ofrece una pantalla 404 para rutas desconocidas', async () => {
    renderRoute('/ruta-inexistente')

    expect(
      await screen.findByRole('heading', { name: 'Página no encontrada' }),
    ).toBeVisible()
  })
})
