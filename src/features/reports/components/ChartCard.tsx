import { useId, type ReactNode } from 'react'

export interface ChartCardProps {
  readonly children: ReactNode
  readonly description: string
  readonly legend?: ReactNode
  readonly title: string
}

export function ChartCard({ children, description, legend, title }: ChartCardProps) {
  const titleId = useId()
  const descriptionId = useId()
  return (
    <section aria-describedby={descriptionId} aria-labelledby={titleId} className="chart-card">
      <header>
        <div>
          <h2 id={titleId}>{title}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        {legend && <div className="chart-card__legend">{legend}</div>}
      </header>
      <div className="chart-card__content">{children}</div>
    </section>
  )
}

export interface BarChartItem {
  readonly label: string
  readonly value: number
  readonly valueLabel: string
}

export function AccessibleBarChart({ items }: { readonly items: readonly BarChartItem[] }) {
  const maximum = Math.max(...items.map((item) => item.value), 1)
  return (
    <ul className="report-bar-chart">
      {items.map((item) => (
        <li key={item.label}>
          <div><span>{item.label}</span><strong>{item.valueLabel}</strong></div>
          <span aria-hidden="true" className="report-bar-chart__track">
            <span style={{ width: `${Math.max(2, (item.value / maximum) * 100)}%` }} />
          </span>
        </li>
      ))}
    </ul>
  )
}
