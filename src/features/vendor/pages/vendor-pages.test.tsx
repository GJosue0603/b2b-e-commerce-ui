import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderTestApp } from '../../../test/renderApp'

describe('gestión de catálogo del Vendedor', () => {
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
})
