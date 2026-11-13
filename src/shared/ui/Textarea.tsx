import type { TextareaHTMLAttributes } from 'react'
import { FormField } from './FormField'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  hint?: string
  label: string
  loading?: boolean
}

export function Textarea({
  className,
  disabled = false,
  error,
  hint,
  id,
  label,
  loading = false,
  required = false,
  rows = 4,
  ...textareaProps
}: TextareaProps) {
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
        <textarea
          {...textareaProps}
          aria-busy={loading || undefined}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={['ui-control', 'ui-textarea', className]
            .filter(Boolean)
            .join(' ')}
          disabled={disabled || loading}
          id={controlId}
          required={required}
          rows={rows}
        />
      )}
    </FormField>
  )
}
