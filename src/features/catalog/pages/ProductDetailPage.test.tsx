import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppServicesProvider } from '../../../app/services'
import { createMockServices } from '../../../mocks/repositories'
import type { AppServices } from '../../../services'
import { ProductDetailPage } from './ProductDetailPage'

const keyboardPath = '/producto/demo-producto-teclado-mecanico'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

async function renderDetail(activePyme = false) {
  const services = createMockServices({ latencyMs: 0 })
  const session = activePyme
    ? await services.demoSession.getByScenario('buyer-pyme-active')
    : null

  render(
    <AppServicesProvider services={services}>
      <MemoryRouter initialEntries={[keyboardPath]}>
        <Routes>
          <Route
            element={
              <ProductDetailPage accreditation={session?.accreditation} />
            }
            path="/producto/:productId"
          />
        </Routes>
      </MemoryRouter>
    </AppServicesProvider>,
  )
}

describe('ProductDetailPage', () => {
  it('muestra detalle, breadcrumb, galería y precio regular', async () => {
    await renderDetail()

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Teclado mecánico inalámbrico',
      }),
    ).toBeVisible()
    expect(screen.getByRole('navigation', { name: 'Migas de pan' })).toBeVisible()
    expect(
      screen.getByRole('button', {
        name: /mostrar imagen 1 de teclado mecánico inalámbrico/i,
      }),
    ).toBeEnabled()
    expect(document.body.textContent).toContain('₡42.900')
    expect(document.body.textContent).not.toContain('₡39.900')
  })

  it('muestra preferencial y referencia regular para PYME vigente', async () => {
    await renderDetail(true)

    expect(await screen.findByText('Precio PYME')).toBeVisible()
    expect(document.body.textContent).toContain('₡39.900')
    expect(document.body.textContent).toContain('₡42.900')
  })

  it('muestra producto no encontrado', async () => {
    const services = createMockServices({ latencyMs: 0 })
    render(
      <AppServicesProvider services={services}>
        <MemoryRouter initialEntries={['/producto/no-existe']}>
          <Routes>
            <Route
              element={<ProductDetailPage />}
              path="/producto/:productId"
            />
          </Routes>
        </MemoryRouter>
      </AppServicesProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Producto no encontrado' }),
    ).toBeVisible()
  })

  it('mantiene skeleton mientras el repositorio carga', () => {
    const base = createMockServices({ latencyMs: 0 })
    const pending = new Promise<never>(() => undefined)
    const services: AppServices = {
      ...base,
      catalog: {
        ...base.catalog,
        getProductById: () => pending,
      },
    }

    render(
      <AppServicesProvider services={services}>
        <MemoryRouter initialEntries={[keyboardPath]}>
          <Routes>
            <Route
              element={<ProductDetailPage />}
              path="/producto/:productId"
            />
          </Routes>
        </MemoryRouter>
      </AppServicesProvider>,
    )

    expect(screen.getByLabelText('Cargando detalle del producto')).toBeVisible()
  })

  it('usa detalle HTTP y no presenta especificaciones ficticias en modo API', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '/v1')
    vi.stubEnv('VITE_CATALOG_DATA_MODE', 'api')

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
      descripcion: 'Descripción procedente de la respuesta HTTP.',
      categoria: category,
      precioRegular: 10000,
      precioPyme: 9000,
      existencias: 3,
      imagenUrl: '/images/api/producto.jpg',
      activo: true,
      creadoPor: category.creadoPor,
      fechaCreacion: '2026-01-01T00:00:00Z',
    }
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const path = new URL(String(input), 'http://localhost').pathname
      return new Response(
        JSON.stringify(path.includes('/categorias/') ? category : product),
        { headers: { 'Content-Type': 'application/json' } },
      )
    })

    const services = createMockServices({ latencyMs: 0 })
    render(
      <AppServicesProvider services={services}>
        <MemoryRouter
          initialEntries={['/producto/507f1f77bcf86cd799439011']}
        >
          <Routes>
            <Route
              element={<ProductDetailPage />}
              path="/producto/:productId"
            />
          </Routes>
        </MemoryRouter>
      </AppServicesProvider>,
    )

    expect(await screen.findByRole('heading', { name: product.nombre })).toBeVisible()
    expect(screen.getByText(product.descripcion)).toBeVisible()
    expect(
      screen.getByText(/La API actual no proporciona especificaciones técnicas/),
    ).toBeVisible()
    expect(screen.queryByText('Bluetooth y conexión USB')).toBeNull()
    expect(screen.queryByText('12 meses con soporte técnico local')).toBeNull()
  })
})
