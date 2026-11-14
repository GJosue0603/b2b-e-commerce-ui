import type { InputHTMLAttributes, ReactNode } from 'react'
import { FormField } from './FormField'

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  endAdornment?: ReactNode
  error?: string
  hint?: string
  label: string
  loading?: boolean
}

export function TextField({
  className,
  disabled = false,
  endAdornment,
  error,
  hint,
  id,
  label,
  loading = false,
  required = false,
  ...inputProps
}: TextFieldProps) {
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
        <>
          <input
            {...inputProps}
            aria-busy={loading || undefined}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className={['ui-control', className].filter(Boolean).join(' ')}
            disabled={disabled || loading}
            id={controlId}
            required={required}
          />
          {endAdornment}
        </>
      )}
    </FormField>
  )
}
