import type { CatalogQuery, CatalogQueryPatch } from '../catalog-query'

export interface CatalogActiveFiltersProps {
  readonly categoryName?: string
  readonly filters: CatalogQuery
  readonly onChange: (patch: CatalogQueryPatch) => void
}

export function CatalogActiveFilters({
  categoryName,
  filters,
  onChange,
}: CatalogActiveFiltersProps) {
  const activeFilters = [
    filters.query
      ? { label: `Búsqueda: ${filters.query}`, remove: () => onChange({ query: '' }) }
      : null,
    filters.categoryId
      ? {
          label: categoryName ?? 'Categoría seleccionada',
          remove: () => onChange({ categoryId: '' }),
        }
      : null,
    filters.availability !== 'all'
      ? {
          label:
            filters.availability === 'in-stock' ? 'Con existencias' : 'Agotados',
          remove: () => onChange({ availability: 'all' }),
        }
      : null,
    filters.minimumPrice !== undefined
      ? {
          label: `Desde ₡${filters.minimumPrice.toLocaleString('es-CR')}`,
          remove: () => onChange({ minimumPrice: null }),
        }
      : null,
    filters.maximumPrice !== undefined
      ? {
          label: `Hasta ₡${filters.maximumPrice.toLocaleString('es-CR')}`,
          remove: () => onChange({ maximumPrice: null }),
        }
      : null,
  ].filter((item) => item !== null)

  if (activeFilters.length === 0) return null

  return (
    <div aria-label="Filtros activos" className="catalog-active-filters">
      {activeFilters.map((filter) => (
        <button
          aria-label={`Quitar filtro ${filter.label}`}
          key={filter.label}
          onClick={filter.remove}
          type="button"
        >
          {filter.label} <span aria-hidden="true">×</span>
        </button>
      ))}
    </div>
  )
}
