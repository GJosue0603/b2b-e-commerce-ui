import { Badge, type BadgeVariant } from '../../../shared/ui'

export type StockState = 'available' | 'low' | 'out-of-stock'

export interface StockBadgeProps {
  readonly lowStockThreshold?: number
  readonly quantity: number
}

interface StockPresentation {
  readonly label: string
  readonly state: StockState
  readonly variant: BadgeVariant
}

function getStockPresentation(
  quantity: number,
  lowStockThreshold: number,
): StockPresentation {
  if (quantity <= 0) {
    return { label: 'Agotado', state: 'out-of-stock', variant: 'danger' }
  }
  if (quantity <= lowStockThreshold) {
    return { label: 'Pocas unidades', state: 'low', variant: 'warning' }
  }
  return { label: 'En stock', state: 'available', variant: 'success' }
}

export function StockBadge({
  lowStockThreshold = 5,
  quantity,
}: StockBadgeProps) {
  const presentation = getStockPresentation(quantity, lowStockThreshold)

  return (
    <Badge data-stock-state={presentation.state} variant={presentation.variant}>
      {presentation.label}
    </Badge>
  )
}
