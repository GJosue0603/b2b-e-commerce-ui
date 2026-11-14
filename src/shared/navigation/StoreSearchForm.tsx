import { useId, type FormEventHandler } from 'react'
import { Form } from 'react-router-dom'
import {
  catalogSearchParameter,
  routePatterns,
} from '../../app/router/paths'
import { SearchIcon } from './StoreIcons'

export interface StoreSearchFormProps {
  readonly className?: string
  readonly onSubmit?: FormEventHandler<HTMLFormElement>
}

export function StoreSearchForm({
  className,
  onSubmit,
}: StoreSearchFormProps) {
  const inputId = useId()

  return (
    <Form
      action={routePatterns.catalog}
      className={['store-search', className].filter(Boolean).join(' ')}
      method="get"
      onSubmit={onSubmit}
      role="search"
    >
      <label className="sr-only" htmlFor={inputId}>
        Buscar productos
      </label>
      <input
        autoComplete="off"
        id={inputId}
        name={catalogSearchParameter}
        placeholder="Buscar productos..."
        type="search"
      />
      <button aria-label="Buscar" type="submit">
        <SearchIcon />
      </button>
    </Form>
  )
}
