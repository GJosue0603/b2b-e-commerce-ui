import type { HTMLAttributes, ReactNode } from 'react'

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  dismissLabel?: string
  onDismiss?: () => void
  title?: string
  variant?: AlertVariant
}

export function Alert({
  children,
  className,
  dismissLabel = 'Cerrar aviso',
  onDismiss,
  title,
  variant = 'info',
  ...alertProps
}: AlertProps) {
  return (
    <div
      {...alertProps}
      className={['ui-alert', `ui-alert--${variant}`, className]
        .filter(Boolean)
        .join(' ')}
      role={variant === 'danger' ? 'alert' : 'status'}
    >
      <span className="ui-alert__indicator" aria-hidden="true" />
      <div className="ui-alert__content">
        {title && <strong className="ui-alert__title">{title}</strong>}
        <div>{children}</div>
      </div>
      {onDismiss && (
        <button
          aria-label={dismissLabel}
          className="ui-icon-button"
          onClick={onDismiss}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  )
}
