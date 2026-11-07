import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type {
  AcreditacionPyme,
  EstadoAcreditacionPyme,
  Producto,
  SolicitudPymeAprobada,
} from '../../../domain'
import { formatCRC } from '../../../shared/utils/pricing'
import { PriceDisplay } from './PriceDisplay'
import { ProductCard, type ProductCardProps } from './ProductCard'
import { StockBadge } from './StockBadge'

const approvedRequest = {
  id: 'solicitud-prueba',
  usuarioId: 'usuario-prueba',
  nombreComercial: 'Negocio de prueba',
  identificacionNegocio: 'TEST-001',
  actividadEconomica: 'Pruebas',
  documentos: [],
  estado: 'aprobada',
  fechaSolicitud: '2026-01-01T00:00:00.000Z',
  revisadoPor: { id: 'admin-prueba', nombre: 'Admin Prueba' },
  fechaRevision: '2026-01-02T00:00:00.000Z',
} as const satisfies SolicitudPymeAprobada

const product = {
  id: 'producto-prueba',
  nombre: 'Producto de prueba',
  descripcion: 'Descripción demostrativa.',
  categoriaId: 'categoria-prueba',
  precioRegular: 50_000,
  precioPyme: 45_000,
  existencias: 8,
  imagenUrl: '/producto-prueba.webp',
  activo: true,
  creadoPor: { id: 'vendedor-prueba', nombre: 'Vendedor Prueba' },
  fechaCreacion: '2026-01-01T00:00:00.000Z',
} as const satisfies Producto

function accreditation(
  state: EstadoAcreditacionPyme,
  start = '2026-01-01T00:00:00.000Z',
  expiration = '2026-12-31T23:59:59.000Z',
): AcreditacionPyme {
  return {
    id: `acreditacion-${state}`,
    usuarioId: 'usuario-prueba',
    solicitudPyme: approvedRequest,
    fechaInicio: start,
    fechaVencimiento: expiration,
    estado: state,
  }
}

function renderCard(overrides: Partial<ProductCardProps> = {}) {
  const props: ProductCardProps = {
    cta: { kind: 'detail', label: 'Ver detalle', to: '/producto/prueba' },
    image: { alt: 'Vista del producto', src: '/imagen-personalizada.webp' },
    product,
    ...overrides,
  }

  render(
    <MemoryRouter>
      <ProductCard {...props} />
    </MemoryRouter>,
  )
}

describe('PriceDisplay', () => {
  it.each([
    ['visitante', null],
    ['solicitud pendiente', undefined],
    ['acreditación vencida', accreditation('vencida')],
  ])('muestra solo precio regular para %s', (_, customerAccreditation) => {
    render(
      <PriceDisplay
        accreditation={customerAccreditation}
        pymePrice={45_000}
        referenceDate={new Date('2026-06-01T00:00:00.000Z')}
        regularPrice={50_000}
      />,
    )

    expect(screen.getByText('Precio')).toBeVisible()
    expect(screen.queryByText('Precio PYME')).toBeNull()
    expect(document.body.textContent).toContain(formatCRC(50_000))
    expect(document.body.textContent).not.toContain(formatCRC(45_000))
  })

  it('muestra Precio PYME solo con acreditación activa dentro de vigencia', () => {
    render(
      <PriceDisplay
        accreditation={accreditation('activa')}
        pymePrice={45_000}
        referenceDate={new Date('2026-06-01T00:00:00.000Z')}
        regularPrice={50_000}
      />,
    )

    expect(screen.getByText('Precio PYME')).toBeVisible()
    expect(document.body.textContent).toContain(formatCRC(45_000))
    expect(document.body.textContent).toContain(formatCRC(50_000))
  })

  it('rechaza una acreditación activa fuera de sus fechas', () => {
    render(
      <PriceDisplay
        accreditation={accreditation('activa')}
        pymePrice={45_000}
        referenceDate={new Date('2027-01-01T00:00:00.000Z')}
        regularPrice={50_000}
      />,
    )

    expect(screen.queryByText('Precio PYME')).toBeNull()
  })

  it('recalcula inmediatamente cuando la acreditación cambia a revocada', () => {
    const referenceDate = new Date('2026-06-01T00:00:00.000Z')
    const { rerender } = render(
      <PriceDisplay
        accreditation={accreditation('activa')}
        pymePrice={45_000}
        referenceDate={referenceDate}
        regularPrice={50_000}
      />,
    )
    expect(screen.getByText('Precio PYME')).toBeVisible()

    rerender(
      <PriceDisplay
        accreditation={accreditation('revocada')}
        pymePrice={45_000}
        referenceDate={referenceDate}
        regularPrice={50_000}
      />,
    )

    expect(screen.queryByText('Precio PYME')).toBeNull()
    expect(document.body.textContent).toContain(formatCRC(50_000))
  })
})

describe('ProductCard y StockBadge', () => {
  it('usa imagen y CTA de detalle recibidos por props', () => {
    renderCard()

    expect(screen.getByRole('img', { name: 'Vista del producto' })).toHaveAttribute(
      'src',
      '/imagen-personalizada.webp',
    )
    expect(screen.getByRole('link', { name: 'Ver detalle' })).toHaveAttribute(
      'href',
      '/producto/prueba',
    )
  })

  it('integra el precio PYME cuando recibe acreditación activa y vigente', () => {
    renderCard({
      accreditation: accreditation('activa'),
      pricingReferenceDate: new Date('2026-06-01T00:00:00.000Z'),
    })

    expect(screen.getByText('Precio PYME')).toBeVisible()
    expect(document.body.textContent).toContain(formatCRC(product.precioPyme))
  })

  it('desactiva añadir al carrito cuando no hay existencias', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderCard({
      cta: {
        kind: 'add-to-cart',
        label: 'Añadir al carrito',
        onClick,
      },
      product: { ...product, existencias: 0 },
    })

    const addButton = screen.getByRole('button', {
      name: 'Añadir al carrito',
    })
    expect(addButton).toBeDisabled()
    expect(screen.getByText('Agotado')).toBeVisible()
    await user.click(addButton)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('distingue inventario bajo del disponible', () => {
    const { rerender } = render(<StockBadge quantity={3} />)
    expect(screen.getByText('Pocas unidades')).toHaveAttribute(
      'data-stock-state',
      'low',
    )

    rerender(<StockBadge quantity={10} />)
    expect(screen.getByText('En stock')).toHaveAttribute(
      'data-stock-state',
      'available',
    )
  })
})
