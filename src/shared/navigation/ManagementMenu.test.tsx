import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DashboardHeader } from './DashboardHeader'
import { getDashboardNavigation } from './navigation'

describe('navegación común y administración', () => {
  it('conserva Inicio y Catálogo y permite navegar por un menú administrativo compacto', async () => {
    const user = userEvent.setup()
    const signOut = vi.fn()
    const router = createMemoryRouter([{ path: '*', element: <DashboardHeader items={getDashboardNavigation('administrador')} onSignOut={signOut} role="administrador" /> }], { initialEntries: ['/admin/usuarios'] })
    render(<RouterProvider router={router} />)
    const nav = screen.getByRole('navigation', { name: 'Navegación de Administrador' })
    expect(within(nav).getByRole('link', { name: 'Inicio' })).toBeVisible()
    expect(within(nav).getByRole('link', { name: 'Catálogo' })).toBeVisible()
    expect(within(nav).queryByRole('link', { name: 'Usuarios' })).toBeNull()
    const trigger = within(nav).getByRole('button', { name: 'Administración' })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(within(nav).getByRole('link', { name: 'Usuarios' })).toHaveAttribute('aria-current', 'page')
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
    await user.click(trigger)
    await user.click(within(nav).getByRole('link', { name: 'Productos' }))
    expect(router.state.location.pathname).toBe('/admin/productos')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(within(nav).getByRole('link', { name: 'Catálogo' }))
    expect(router.state.location.pathname).toBe('/catalogo')
    expect(trigger).not.toHaveClass('navigation-link--active')
    await user.click(trigger)
    await user.click(document.body)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(signOut).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Carrito, 0 productos' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cuenta de Administrador' })).toBeVisible()
  })
})
