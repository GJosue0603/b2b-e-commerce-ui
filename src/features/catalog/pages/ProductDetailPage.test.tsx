import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppServicesProvider } from '../../../app/services'
import { createMockServices } from '../../../mocks/repositories'
import type { AppServices } from '../../../services'
import { ProductDetailPage } from './ProductDetailPage'

const keyboardPath = '/producto/demo-producto-teclado-mecanico'

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
})
