import type { ReactNode } from 'react'

export type KpiCardTone = 'neutral' | 'success' | 'warning' | 'danger'

export interface KpiCardProps {
  readonly detail?: ReactNode
  readonly label: string
  readonly tone?: KpiCardTone
  readonly value: ReactNode
}

export function KpiCard({
  detail,
  label,
  tone = 'neutral',
  value,
}: KpiCardProps) {
  return (
    <article className={`ui-kpi-card ui-kpi-card--${tone}`}>
      <span className="ui-kpi-card__label">{label}</span>
      <strong className="ui-kpi-card__value">{value}</strong>
      {detail && <span className="ui-kpi-card__detail">{detail}</span>}
    </article>
  )
}
