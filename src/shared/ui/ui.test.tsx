import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  Alert,
  Button,
  ConfirmDialog,
  EmptyState,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Textarea,
  TextField,
} from '.'

describe('primitivas de interfaz', () => {
  it('deshabilita un botón mientras está cargando', () => {
    render(<Button loading>Guardar</Button>)

    const button = screen.getByRole('button', { name: /guardar/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('relaciona etiquetas, ayuda y errores con sus campos', () => {
    render(
      <TextField
        error="El correo no es válido."
        hint="Usa tu correo empresarial."
        label="Correo"
        required
      />,
    )

    const input = screen.getByRole('textbox', { name: 'Correo' })
    expect(input).toBeInvalid()
    expect(input).toHaveAccessibleDescription(
      'Usa tu correo empresarial. El correo no es válido.',
    )
  })

  it('expone estados disabled y loading en los controles de formulario', () => {
    render(
      <>
        <Select disabled label="Categoría">
          <option>Accesorios</option>
        </Select>
        <Textarea label="Detalle" loading />
      </>,
    )

    expect(screen.getByLabelText('Categoría')).toBeDisabled()
    expect(screen.getByLabelText('Detalle')).toBeDisabled()
    expect(screen.getByLabelText('Detalle')).toHaveAttribute('aria-busy', 'true')
  })

  it('permite descartar avisos', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()

    render(
      <Alert onDismiss={onDismiss} title="Aviso">
        Contenido
      </Alert>,
    )
    await user.click(screen.getByRole('button', { name: 'Cerrar aviso' }))

    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('notifica cambios de página y marca la página actual', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <Pagination
        currentPage={4}
        onPageChange={onPageChange}
        totalPages={12}
      />,
    )

    expect(screen.getByRole('button', { name: 'Ir a la página 4' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await user.click(
      screen.getByRole('button', { name: 'Ir a la página siguiente' }),
    )
    expect(onPageChange).toHaveBeenCalledWith(5)
  })

  it('cierra el modal mediante su control accesible', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Modal onClose={onClose} open title="Detalle">
        Contenido
      </Modal>,
    )
    await user.click(screen.getByRole('button', { name: 'Cerrar diálogo' }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('compone la confirmación y comunica la acción elegida', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        open
        title="Confirmar"
      >
        ¿Continuar?
      </ConfirmDialog>,
    )
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('ofrece nombres accesibles para carga y estados vacíos', () => {
    render(
      <>
        <Skeleton label="Cargando productos" lines={2} />
        <EmptyState description="Agrega un producto." title="Sin resultados" />
      </>,
    )

    expect(screen.getByRole('status', { name: 'Cargando productos' })).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Sin resultados' }),
    ).toBeVisible()
  })
})
