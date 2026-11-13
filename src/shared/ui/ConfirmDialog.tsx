import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

export interface ConfirmDialogProps {
  cancelLabel?: string
  children: ReactNode
  confirmLabel?: string
  confirmLoading?: boolean
  destructive?: boolean
  disabled?: boolean
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  title: string
}

export function ConfirmDialog({
  cancelLabel = 'Cancelar',
  children,
  confirmLabel = 'Confirmar',
  confirmLoading = false,
  destructive = false,
  disabled = false,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) {
  return (
    <Modal
      footer={
        <>
          <Button disabled={confirmLoading} onClick={onCancel} variant="ghost">
            {cancelLabel}
          </Button>
          <Button
            disabled={disabled}
            loading={confirmLoading}
            onClick={onConfirm}
            variant={destructive ? 'danger' : 'primary'}
          >
            {confirmLabel}
          </Button>
        </>
      }
      onClose={onCancel}
      open={open}
      size="sm"
      title={title}
    >
      {children}
    </Modal>
  )
}
