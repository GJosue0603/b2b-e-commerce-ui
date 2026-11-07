import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createMockServices } from '../../../mocks/repositories'
import type { AppServices, CatalogRepository } from '../../../services'
import { AppServicesProvider } from '../../../app/services'
import { formatColones } from '../../../shared/utils/currency'
import { HomePage } from './HomePage'

function renderHome(catalogOverride?: Partial<CatalogRepository>) {
  const baseServices = createMockServices({ latencyMs: 0 })
  const services: AppServices = {
    ...baseServices,
    catalog: {
      ...baseServices.catalog,
      ...catalogOverride,
    },
  }

  render(
    <AppServicesProvider services={services}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </AppServicesProvider>,
  )
}

describe('HomePage', () => {
  it('renderiza cuatro destacados con precio regular y CTA reales', async () => {
    renderHome()

    expect(
      screen.getByRole('link', { name: /explorar productos/i }),
    ).toHaveAttribute('href', '/catalogo')
    expect(
      screen.getByRole('link', { name: /solicitar acreditación pyme/i }),
    ).toHaveAttribute('href', '/acreditacion/solicitar')

    expect(await screen.findAllByRole('article')).toHaveLength(4)
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === 'STRONG' &&
          element.textContent === formatColones(42_900),
      ),
    ).toBeVisible()
    expect(
      screen.queryByText(
        (_, element) =>
          element?.tagName === 'STRONG' &&
          element.textContent === formatColones(39_900),
      ),
    ).toBeNull()
  })

  it('crea enlaces parametrizados para las categorías del repositorio', async () => {
    renderHome()

    const officeCategory = await screen.findByRole('link', {
      name: /accesorios de oficina/i,
    })
    expect(officeCategory).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/catalogo\?categoria=/),
    )
  })

  it('muestra skeletons durante la carga', () => {
    const pending = new Promise<never>(() => undefined)
    renderHome({
      listCategories: () => pending,
      listProducts: () => pending,
    })

    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
  })

  it('muestra un estado vacío cuando el catálogo no tiene datos', async () => {
    renderHome({
      listCategories: async () => [],
      listProducts: async () => [],
    })

    expect(
      await screen.findByRole('heading', { name: 'El catálogo está vacío' }),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Ir al catálogo' })).toHaveAttribute(
      'href',
      '/catalogo',
    )
  })
})
