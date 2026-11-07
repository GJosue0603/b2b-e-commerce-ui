import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from 'react'

export type ModalSize = 'sm' | 'md' | 'lg'

export interface ModalProps {
  children: ReactNode
  closeLabel?: string
  description?: string
  footer?: ReactNode
  onClose: () => void
  open: boolean
  size?: ModalSize
  title: string
}

export function Modal({
  children,
  closeLabel = 'Cerrar diálogo',
  description,
  footer,
  onClose,
  open,
  size = 'md',
  title,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={`ui-modal ui-modal--${size}`}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
      ref={dialogRef}
    >
      <div className="ui-modal__panel">
        <header className="ui-modal__header">
          <div>
            <h2 className="ui-modal__title" id={titleId}>
              {title}
            </h2>
            {description && (
              <p className="ui-modal__description" id={descriptionId}>
                {description}
              </p>
            )}
          </div>
          <button
            aria-label={closeLabel}
            className="ui-icon-button"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div className="ui-modal__body">{children}</div>
        {footer && <footer className="ui-modal__footer">{footer}</footer>}
      </div>
    </dialog>
  )
}
