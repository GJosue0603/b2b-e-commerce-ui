import { render, screen, within } from '@testing-library/react'
import {
  createMemoryRouter,
  RouterProvider,
  type InitialEntry,
} from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { routeDefinitions } from './routes'

function renderRoute(initialEntry: InitialEntry) {
  const router = createMemoryRouter(routeDefinitions, {
    initialEntries: [initialEntry],
  })

  render(<RouterProvider router={router} />)
  return router
}

const routeCases = [
  ['/', 'Inicio'],
  ['/catalogo', 'Catálogo'],
  ['/producto/producto-demo', 'Detalle de producto'],
  ['/carrito', 'Carrito'],
  ['/checkout', 'Revisar y pagar'],
  ['/pago/resultado', 'Resultado del pago'],
  ['/ingresar', 'Iniciar sesión'],
  ['/registro', 'Crear cuenta'],
  ['/mi-cuenta', 'Mi cuenta'],
  ['/mis-pedidos', 'Mis pedidos'],
  ['/acreditacion/solicitar', 'Solicitar acreditación'],
  ['/acreditacion/estado', 'Mi acreditación PYME'],
  ['/vendedor/productos', 'Productos e inventario'],
  ['/vendedor/productos/nuevo', 'Nuevo producto'],
  ['/vendedor/productos/producto-demo/editar', 'Editar producto'],
  ['/vendedor/categorias', 'Categorías'],
  ['/vendedor/reportes', 'Análisis de ventas'],
  ['/admin/acreditaciones', 'Solicitudes PYME'],
  ['/admin/acreditaciones/solicitud-demo', 'Revisar solicitud PYME'],
  ['/admin/usuarios', 'Usuarios'],
  ['/admin/productos', 'Productos'],
  ['/admin/pedidos', 'Pedidos'],
  ['/admin/reportes', 'Análisis de ventas'],
] as const

describe('mapa de rutas', () => {
  it.each(routeCases)('renderiza %s sin romper la pantalla', async (path, title) => {
    renderRoute(path)

    expect(
      await screen.findByRole('heading', { level: 1, name: title }),
    ).toBeVisible()
  })

  it('redirige las raíces internas a la primera opción permitida', async () => {
    const sellerRouter = renderRoute('/vendedor')
    await screen.findByRole('heading', { name: 'Productos e inventario' })
    expect(sellerRouter.state.location.pathname).toBe('/vendedor/productos')
  })

  it('muestra únicamente las opciones del Vendedor', async () => {
    renderRoute('/vendedor/productos')
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
    renderRoute('/admin/acreditaciones')
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
    const { unmount } = render(
      <RouterProvider
        router={createMemoryRouter(routeDefinitions, {
          initialEntries: ['/catalogo'],
        })}
      />,
    )
    expect(screen.getAllByRole('link', { name: 'Ingresar' })).toHaveLength(2)
    expect(screen.queryByRole('link', { name: 'Mi cuenta' })).toBeNull()

    unmount()
    renderRoute('/mi-cuenta')
    expect(await screen.findAllByRole('link', { name: 'Mi cuenta' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Mis pedidos' }).length).toBeGreaterThan(0)
  })

  it('ofrece una pantalla 404 para rutas desconocidas', async () => {
    renderRoute('/ruta-inexistente')

    expect(
      await screen.findByRole('heading', { name: 'Página no encontrada' }),
    ).toBeVisible()
  })
})
