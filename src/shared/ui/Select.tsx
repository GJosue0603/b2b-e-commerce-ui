import type { ReactNode, SelectHTMLAttributes } from 'react'
import { FormField } from './FormField'

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  children: ReactNode
  error?: string
  hint?: string
  label: string
  loading?: boolean
}

export function Select({
  children,
  className,
  disabled = false,
  error,
  hint,
  id,
  label,
  loading = false,
  required = false,
  ...selectProps
}: SelectProps) {
  return (
    <FormField
      error={error}
      hint={hint}
      id={id}
      label={label}
      loading={loading}
      required={required}
    >
      {({ controlId, describedBy, invalid }) => (
        <select
          {...selectProps}
          aria-busy={loading || undefined}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={['ui-control', 'ui-select', className]
            .filter(Boolean)
            .join(' ')}
          disabled={disabled || loading}
          id={controlId}
          required={required}
        >
          {children}
        </select>
      )}
    </FormField>
  )
}
