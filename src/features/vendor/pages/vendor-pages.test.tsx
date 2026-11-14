import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderTestApp } from '../../../test/renderApp'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('gestión de catálogo del Vendedor', () => {
  it.each([
    ['/vendedor/productos', 'seller', 'Productos e inventario', 'Gestión comercial'],
    ['/vendedor/productos/nuevo', 'seller', 'Nuevo producto', 'Catálogo compartido'],
    ['/admin/productos', 'administrator', 'Supervisión de productos', 'Supervisión administrativa'],
  ] as const)(
    'muestra %s sin rótulos sobre el título',
    async (path, scenario, heading, removedLabel) => {
      renderTestApp(path, scenario)

      expect(await screen.findByRole('heading', { name: heading })).toBeVisible()
      expect(screen.queryByText(removedLabel)).toBeNull()
    },
  )

  it('crea un producto y lo refleja en listado y catálogo público sin recargar', async () => {
    const user = userEvent.setup()
    const { router } = renderTestApp('/vendedor/productos/nuevo', 'seller')

    await screen.findByRole('heading', { name: 'Nuevo producto' })
    await user.type(screen.getByLabelText('Nombre*'), 'Base USB-C Demo')
    await user.selectOptions(screen.getByLabelText('Categoría*'), 'demo-categoria-accesorios-oficina')
    await user.type(screen.getByLabelText('Descripción*'), 'Base creada desde la gestión demostrativa.')
    await user.type(screen.getByLabelText('Precio regular (₡)*'), '25000')
    await user.type(screen.getByLabelText('Precio PYME (₡)*'), '22500')
    await user.type(screen.getByLabelText('Existencias*'), '8')
    await user.type(screen.getByLabelText('URL o recurso local*'), '/images/demo/base-usb.webp')
    await user.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByText('Base USB-C Demo')).toBeVisible()
    expect(router.state.location.pathname).toBe('/vendedor/productos')

    await router.navigate('/catalogo')
    expect(await screen.findByText('Base USB-C Demo')).toBeVisible()
  })

  it('combina búsqueda y filtros y muestra empty state', async () => {
    const user = userEvent.setup()
    renderTestApp('/vendedor/productos', 'seller')

    await screen.findByText('Teclado mecánico inalámbrico')
    await user.type(screen.getByLabelText('Buscar productos'), 'resultado inexistente')
    expect(await screen.findByRole('heading', { name: 'No hay productos que coincidan' })).toBeVisible()
  })

  it('mantiene la supervisión administrativa en modo lectura', async () => {
    renderTestApp('/admin/productos', 'administrator')

    await screen.findByRole('heading', { name: 'Supervisión de productos' })
    expect(screen.queryByRole('button', { name: 'Nuevo producto' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Desactivar' })).toBeNull()
  })

  it('reserva la gestión de categorías al área administrativa', async () => {
    renderTestApp('/admin/categorias', 'administrator')

    expect(await screen.findByRole('heading', { name: 'Categorías de productos' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Nueva categoría' })).toBeVisible()
  })

  it('usa la lista pública de productos en API y bloquea mutaciones sin endpoint', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '/v1')
    vi.stubEnv('VITE_CATALOG_DATA_MODE', 'api')
    vi.stubEnv('VITE_AUTH_MODE', 'demo')
    vi.stubEnv('VITE_CART_DATA_MODE', 'demo')

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
      precioPyme: 9000,
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
        return new Response(
          JSON.stringify({
            cantidadTotalDeItems: items.length,
            items,
            numeroDePagina: 1,
            cantidadPorPagina: 100,
            totalDePaginas: 1,
          }),
          { headers: { 'Content-Type': 'application/json' } },
        )
      },
    )
    const { router } = renderTestApp('/vendedor/productos', 'seller')

    expect(await screen.findByText('Producto académico API')).toBeVisible()
    expect(screen.queryByText('Teclado mecánico inalámbrico')).toBeNull()
    expect(screen.getByText(/Catálogo API en modo de solo lectura/)).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Nuevo producto' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Desactivar' })).toBeNull()
    expect(
      fetcher.mock.calls.some(
        ([input]) =>
          new URL(String(input), 'http://localhost').pathname ===
          '/v1/productos',
      ),
    ).toBe(true)

    await router.navigate('/vendedor/productos/nuevo')
    expect(
      await screen.findByText(/Edición de productos no disponible en la API/),
    ).toBeVisible()
    expect(screen.queryByLabelText('Nombre*')).toBeNull()
  })
})
