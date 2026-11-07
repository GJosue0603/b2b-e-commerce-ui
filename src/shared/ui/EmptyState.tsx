import type { ReactNode } from 'react'

export interface EmptyStateProps {
  action?: ReactNode
  description: string
  icon?: ReactNode
  title: string
}

export function EmptyState({
  action,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <section className="ui-empty-state">
      {icon && (
        <div className="ui-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className="ui-empty-state__title">{title}</h2>
      <p className="ui-empty-state__description">{description}</p>
      {action && <div className="ui-empty-state__action">{action}</div>}
    </section>
  )
}
