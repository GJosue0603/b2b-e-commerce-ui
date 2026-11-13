import type { CSSProperties, HTMLAttributes } from 'react'

export type SkeletonVariant = 'text' | 'rectangle' | 'circle'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  height?: number | string
  label?: string
  lines?: number
  variant?: SkeletonVariant
  width?: number | string
}

type SkeletonStyle = CSSProperties & {
  '--skeleton-height'?: string
  '--skeleton-width'?: string
}

function formatDimension(value: number | string | undefined) {
  if (typeof value === 'number') return `${value}px`
  return value
}

export function Skeleton({
  className,
  height,
  label = 'Cargando contenido',
  lines = 1,
  variant = 'text',
  width,
  ...skeletonProps
}: SkeletonProps) {
  const count = Math.max(1, Math.floor(lines))
  const style: SkeletonStyle = {
    '--skeleton-height': formatDimension(height),
    '--skeleton-width': formatDimension(width),
  }

  return (
    <div
      {...skeletonProps}
      aria-label={label}
      className={['ui-skeleton-group', className].filter(Boolean).join(' ')}
      role="status"
    >
      {Array.from({ length: count }, (_, index) => (
        <span
          aria-hidden="true"
          className={[
            'ui-skeleton',
            `ui-skeleton--${variant}`,
            index === count - 1 && count > 1 ? 'ui-skeleton--last' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          key={index}
          style={style}
        />
      ))}
    </div>
  )
}
