import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: BadgeVariant
}

export function Badge({
  children,
  className,
  variant = 'neutral',
  ...badgeProps
}: BadgeProps) {
  return (
    <span
      {...badgeProps}
      className={['ui-badge', `ui-badge--${variant}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
