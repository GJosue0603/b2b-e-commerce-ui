import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DashboardHeader } from './DashboardHeader'
import { StoreHeader } from './StoreHeader'

describe('menú de perfil', () => {
  it.each(['comprador', 'administrador', 'vendedor'] as const)(
    'abre y cierra el menú de %s sin cerrar la sesión',
    async role => {
      const signOut = vi.fn()
      const user = userEvent.setup()
      const header = role === 'comprador'
            ? <StoreHeader authenticated onSignOut={signOut} />
            : <DashboardHeader cartItemCount={3} items={[]} role={role} onSignOut={signOut} />
      render(<RouterProvider router={createMemoryRouter([{ path: '*', element: header }])} />)
      if (role !== 'comprador') {
        expect(screen.getByRole('link', { name: 'Carrito, 3 productos' })).toHaveAttribute('href', '/carrito')
      }
      const icon = screen.getByLabelText(role === 'comprador'
        ? 'Mi cuenta'
        : `Cuenta de ${role === 'administrador' ? 'Administrador' : 'Vendedor'}`)
      const menu = icon.closest<HTMLDivElement>('.account-menu')!
      expect(icon).toHaveAttribute('aria-expanded', 'false')
      expect(within(menu).queryByRole('button', { name: 'Cerrar sesión' })).toBeNull()
      await user.click(icon.querySelector('svg')!)
      expect(icon).toHaveAttribute('aria-expanded', 'true')
      expect(signOut).not.toHaveBeenCalled()
      expect(within(menu).getByRole('link', { name: 'Ver cuenta' })).toBeVisible()
      await user.click(icon)
      expect(icon).toHaveAttribute('aria-expanded', 'false')
      expect(signOut).not.toHaveBeenCalled()
      await user.click(icon)
      await user.keyboard('{Escape}')
      expect(icon).toHaveAttribute('aria-expanded', 'false')
      expect(icon).toHaveFocus()
      await user.click(icon)
      await user.click(document.body)
      expect(icon).toHaveAttribute('aria-expanded', 'false')
      expect(signOut).not.toHaveBeenCalled()
      await user.click(icon)
      await user.click(within(menu).getByRole('button', { name: 'Cerrar sesión' }))
      expect(signOut).toHaveBeenCalledTimes(1)
    },
  )
})
