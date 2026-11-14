import { cleanup, render, screen, within } from '@testing-library/react'
import {
  createMemoryRouter,
  RouterProvider,
  type InitialEntry,
} from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockServices } from '../../mocks/repositories'
import { CartProvider } from '../../features/cart/state'
import { AuthProvider } from '../../features/auth/state'
import type { DemoScenarioId } from '../../services'
import { DemoSessionProvider } from '../demoSession'
import { AppServicesProvider } from '../services'
import { routeDefinitions } from './routes'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

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
  ['/vendedor/reportes', 'Análisis de ventas', 'seller'],
  ['/admin/acreditaciones', 'Solicitudes PYME', 'administrator'],
  ['/admin/acreditaciones/demo-solicitud-pyme-pendiente', 'Revisar solicitud PYME', 'administrator'],
  ['/admin/usuarios', 'Usuarios', 'administrator'],
  ['/admin/categorias', 'Categorías de productos', 'administrator'],
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
    await userEvent.setup().click(within(navigation).getByRole('button', { name: 'Gestión de ventas' }))

    expect(within(navigation).getByRole('link', { name: 'Productos' })).toBeVisible()
    expect(within(navigation).queryByRole('link', { name: 'Categorías' })).toBeNull()
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
    await userEvent.setup().click(within(navigation).getByRole('button', { name: 'Administración' }))

    expect(
      within(navigation).getByRole('link', { name: 'Solicitudes PYME' }),
    ).toBeVisible()
    expect(within(navigation).getByRole('link', { name: 'Categorías' })).toBeVisible()
    expect(within(navigation).getByRole('link', { name: 'Pedidos' })).toBeVisible()
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
      const accountDetails = accountMenu.closest<HTMLDivElement>('.account-menu')
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
      await user.click(profileMenu)
      const profileDetails = profileMenu.closest<HTMLDivElement>('.account-menu')
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

  it('muestra la respuesta API en catálogo y no mezcla acreditación demo', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '/v1')
    vi.stubEnv('VITE_CATALOG_DATA_MODE', 'api')
    vi.stubEnv('VITE_AUTH_MODE', 'api')
    vi.stubEnv('VITE_CART_DATA_MODE', 'api')

    const category = {
      id: '507f1f77bcf86cd799439012',
      nombre: 'Categoría académica API',
      descripcion: 'Categoría devuelta por la API',
      activo: true,
      creadoPor: {
        id: '507f1f77bcf86cd799439013',
        nombre: 'Usuario de prueba',
        rol: 'ADMINISTRADOR',
      },
      fechaCreacion: '2026-01-01T00:00:00Z',
    }
    const product = {
      id: '507f1f77bcf86cd799439011',
      nombre: 'Producto académico API',
      descripcion: 'Producto devuelto por la API',
      categoria: category,
      precioRegular: 10000,
      precioPyme: 5000,
      existencias: 3,
      imagenUrl: '/images/api/producto.jpg',
      activo: true,
      creadoPor: category.creadoPor,
      fechaCreacion: '2026-01-01T00:00:00Z',
    }
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(
      async (input) => {
        const path = new URL(String(input), 'http://localhost').pathname
        const items = path === '/v1/productos' ? [product] : [category]
        const body = {
          cantidadTotalDeItems: items.length,
          items,
          numeroDePagina: 1,
          cantidadPorPagina: 100,
          totalDePaginas: 1,
        }
        return new Response(JSON.stringify(body), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    )

    renderRoute('/catalogo', 'buyer-pyme-active')

    expect(await screen.findByText('Producto académico API')).toBeVisible()
    expect(screen.getAllByText('Categoría académica API').length).toBeGreaterThan(0)
    expect(screen.queryByText('Teclado mecánico inalámbrico')).toBeNull()
    expect(screen.queryByText('Precio PYME')).toBeNull()
    const paths = fetcher.mock.calls.map(
      ([input]) => new URL(String(input), 'http://localhost').pathname,
    )
    expect(paths).toContain('/v1/productos')
    expect(paths).toContain('/v1/categorias')
  })

  it('muestra el estado vacío de la respuesta API sin recurrir a fixtures', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '/v1')
    vi.stubEnv('VITE_CATALOG_DATA_MODE', 'api')
    vi.stubEnv('VITE_AUTH_MODE', 'api')
    vi.stubEnv('VITE_CART_DATA_MODE', 'api')

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(
        JSON.stringify({
          cantidadTotalDeItems: 0,
          items: [],
          numeroDePagina: 1,
          cantidadPorPagina: 100,
          totalDePaginas: 0,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )
    renderRoute('/catalogo')

    expect(
      await screen.findByRole('heading', { name: 'No encontramos productos' }),
    ).toBeVisible()
    expect(screen.queryByText('Teclado mecánico inalámbrico')).toBeNull()
  })
})
