import { useId, type ReactNode } from 'react'

interface FormFieldRenderProps {
  controlId: string
  describedBy: string | undefined
  invalid: boolean
}

interface FormFieldProps {
  children: (props: FormFieldRenderProps) => ReactNode
  error?: string
  hint?: string
  id?: string
  label: string
  loading?: boolean
  required?: boolean
}

export function FormField({
  children,
  error,
  hint,
  id,
  label,
  loading = false,
  required = false,
}: FormFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const hintId = hint ? `${controlId}-hint` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={controlId}>
        {label}
        {required && (
          <span className="ui-field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="ui-field__control">
        {children({ controlId, describedBy, invalid: Boolean(error) })}
        {loading && <span className="ui-field__spinner" aria-hidden="true" />}
      </div>
      {hint && (
        <span className="ui-field__hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="ui-field__error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
