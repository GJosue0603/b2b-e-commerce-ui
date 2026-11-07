import { cleanup, render, screen, within } from '@testing-library/react'
import {
  createMemoryRouter,
  RouterProvider,
  type InitialEntry,
} from 'react-router-dom'
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
  ['/acreditacion/solicitar', 'Solicitar acreditación', 'buyer-regular'],
  ['/acreditacion/estado', 'Mi acreditación PYME', 'buyer-regular'],
  ['/vendedor/productos', 'Productos e inventario', 'seller'],
  ['/vendedor/productos/nuevo', 'Nuevo producto', 'seller'],
  ['/vendedor/productos/producto-demo/editar', 'Editar producto', 'seller'],
  ['/vendedor/categorias', 'Categorías', 'seller'],
  ['/vendedor/reportes', 'Análisis de ventas', 'seller'],
  ['/admin/acreditaciones', 'Solicitudes PYME', 'administrator'],
  ['/admin/acreditaciones/solicitud-demo', 'Revisar solicitud PYME', 'administrator'],
  ['/admin/usuarios', 'Usuarios', 'administrator'],
  ['/admin/productos', 'Productos', 'administrator'],
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

  it('distingue la navegación pública de la experiencia Comprador', async () => {
    renderRoute('/catalogo')
    expect(
      screen.getAllByRole('link', { name: 'Ingresar' }).length,
    ).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: 'Mi cuenta' })).toBeNull()

    cleanup()
    renderRoute('/mi-cuenta', 'buyer-regular')
    expect(
      (await screen.findAllByRole('link', { name: 'Mi cuenta' })).length,
    ).toBeGreaterThan(0)
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
