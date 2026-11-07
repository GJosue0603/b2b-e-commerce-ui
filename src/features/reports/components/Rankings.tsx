import { formatCRC } from '../../../shared/utils/pricing'

export interface RankingItem {
  readonly id: string
  readonly ingresos: number
  readonly nombre: string
  readonly unidades: number
}

export interface RankingsProps {
  readonly items: readonly RankingItem[]
  readonly title: string
}

export function Rankings({ items, title }: RankingsProps) {
  return (
    <section className="report-ranking">
      <h2>{title}</h2>
      {items.length === 0 ? <p>Sin productos para este período.</p> : (
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.nombre}</span>
              <strong>{item.unidades} uds.</strong>
              <small>{formatCRC(item.ingresos)}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
