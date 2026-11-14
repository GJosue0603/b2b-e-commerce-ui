import { useId } from 'react'

export interface QuantitySelectorProps {
  readonly disabled?: boolean
  readonly label?: string
  readonly accessibleLabel?: string
  readonly max: number
  readonly min?: number
  readonly onChange: (quantity: number) => void
  readonly value: number
}

export function QuantitySelector({
  disabled = false,
  label = 'Cantidad',
  accessibleLabel,
  max,
  min = 1,
  onChange,
  value,
}: QuantitySelectorProps) {
  const inputId = useId()
  const safeMaximum = Math.max(min, max)
  const controlDisabled = disabled || max < min

  const update = (nextValue: number) => {
    if (
      !Number.isInteger(nextValue) ||
      nextValue < min ||
      nextValue > safeMaximum
    ) {
      return
    }
    onChange(nextValue)
  }

  return (
    <div className="quantity-selector">
      <label htmlFor={inputId}>{label}</label>
      <div className="quantity-selector__controls">
        <button
          aria-label="Disminuir cantidad"
          disabled={controlDisabled || value <= min}
          onClick={() => update(value - 1)}
          type="button"
        >
          −
        </button>
        <input
          aria-label={accessibleLabel}
          aria-invalid={value < min || value > safeMaximum || undefined}
          disabled={controlDisabled}
          id={inputId}
          inputMode="numeric"
          max={safeMaximum}
          min={min}
          onChange={(event) => update(Number(event.target.value))}
          type="number"
          value={value}
        />
        <button
          aria-label="Aumentar cantidad"
          disabled={controlDisabled || value >= safeMaximum}
          onClick={() => update(value + 1)}
          type="button"
        >
          +
        </button>
      </div>
      <small>Máximo disponible: {Math.max(0, max)}</small>
    </div>
  )
}
