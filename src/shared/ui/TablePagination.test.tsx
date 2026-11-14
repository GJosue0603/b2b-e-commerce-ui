import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TablePagination } from './TablePagination'

describe('paginación compartida de tablas', () => {
  it('permite elegir una página y avanzar con los mismos controles numerados', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<TablePagination currentPage={1} totalItems={200} pageSize={25} itemLabel="productos" label="Paginación de productos" onPageChange={onPageChange} />)
    expect(screen.getByText('Mostrando 1–25 de 200 productos')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Ir a la página anterior' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Ir a la página 8' }))
    expect(onPageChange).toHaveBeenLastCalledWith(8)
    await user.click(screen.getByRole('button', { name: 'Ir a la página siguiente' }))
    expect(onPageChange).toHaveBeenLastCalledWith(2)
  })

  it.each([0, 1])('conserva los controles deshabilitados con %s registros', totalItems => {
    render(<TablePagination currentPage={1} totalItems={totalItems} pageSize={25} itemLabel="usuarios" label="Paginación de usuarios" onPageChange={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: 'Paginación de usuarios' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Ir a la página anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Ir a la página siguiente' })).toBeDisabled()
    expect(screen.getByText(`Mostrando ${totalItems === 0 ? '0–0' : '1–1'} de ${totalItems} usuarios`)).toBeVisible()
  })

  it('limita el rango de la última página al total real', () => {
    render(<TablePagination currentPage={2} totalItems={30} pageSize={25} itemLabel="categorías" label="Paginación de categorías" onPageChange={vi.fn()} />)
    expect(screen.getByText('Mostrando 26–30 de 30 categorías')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Ir a la página siguiente' })).toBeDisabled()
  })
})
