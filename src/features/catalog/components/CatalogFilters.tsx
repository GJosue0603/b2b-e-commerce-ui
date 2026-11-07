import { useId, type FormEvent } from 'react'
import type { Categoria } from '../../../domain'
import { Button, Select, TextField } from '../../../shared/ui'
import type { CatalogQuery, CatalogQueryPatch } from '../catalog-query'

export interface CatalogFiltersProps {
  readonly categories: readonly Categoria[]
  readonly filters: CatalogQuery
  readonly onChange: (patch: CatalogQueryPatch) => void
  readonly onClear: () => void
  readonly onSubmit?: () => void
}

function optionalPrice(value: string): number | null {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export function CatalogFilters({
  categories,
  filters,
  onChange,
  onClear,
  onSubmit,
}: CatalogFiltersProps) {
  const searchId = useId()

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onChange({ query: String(data.get('catalog-search') ?? '') })
    onSubmit?.()
  }

  return (
    <div className="catalog-filters">
      <div className="catalog-filters__heading">
        <h2>Filtros</h2>
        <Button onClick={onClear} size="sm" variant="ghost">
          Limpiar
        </Button>
      </div>

      <form className="catalog-filters__search" onSubmit={handleSearch}>
        <TextField
          defaultValue={filters.query}
          id={searchId}
          key={filters.query}
          label="Buscar en catálogo"
          name="catalog-search"
          placeholder="Nombre o descripción"
          type="search"
        />
        <Button fullWidth size="sm" type="submit">
          Buscar
        </Button>
      </form>

      <Select
        label="Categoría"
        onChange={(event) => onChange({ categoryId: event.target.value })}
        value={filters.categoryId}
      >
        <option value="">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.nombre}
          </option>
        ))}
      </Select>

      <fieldset className="catalog-filters__prices">
        <legend>Rango de precios</legend>
        <TextField
          defaultValue={filters.minimumPrice ?? ''}
          key={`minimum-${filters.minimumPrice ?? ''}`}
          label="Precio mínimo"
          min="0"
          onBlur={(event) =>
            onChange({ minimumPrice: optionalPrice(event.target.value) })
          }
          placeholder="₡0"
          type="number"
        />
        <TextField
          defaultValue={filters.maximumPrice ?? ''}
          key={`maximum-${filters.maximumPrice ?? ''}`}
          label="Precio máximo"
          min="0"
          onBlur={(event) =>
            onChange({ maximumPrice: optionalPrice(event.target.value) })
          }
          placeholder="Sin límite"
          type="number"
        />
      </fieldset>

      <Select
        label="Disponibilidad"
        onChange={(event) =>
          onChange({
            availability: event.target.value as CatalogQuery['availability'],
          })
        }
        value={filters.availability}
      >
        <option value="all">Todos</option>
        <option value="in-stock">Con existencias</option>
        <option value="out-of-stock">Agotados</option>
      </Select>
    </div>
  )
}
