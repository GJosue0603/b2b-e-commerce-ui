export interface PaginationProps {
  currentPage: number
  disabled?: boolean
  label?: string
  onPageChange: (page: number) => void
  totalPages: number
  hideWhenSinglePage?: boolean
}

type PaginationItem = number | 'ellipsis'

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) return [1, 2, 3, 'ellipsis', totalPages]

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'ellipsis', currentPage, 'ellipsis', totalPages]
}

export function Pagination({
  currentPage,
  disabled = false,
  label = 'Paginación',
  onPageChange,
  totalPages,
  hideWhenSinglePage = true,
}: PaginationProps) {
  if (totalPages < 2 && hideWhenSinglePage) return null

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const items = getPaginationItems(safeCurrentPage, totalPages)

  return (
    <nav aria-label={label} className="ui-pagination">
      <button
        aria-label="Ir a la página anterior"
        className="ui-pagination__button"
        disabled={disabled || safeCurrentPage === 1}
        onClick={() => onPageChange(safeCurrentPage - 1)}
        type="button"
      >
        <span aria-hidden="true">←</span>
      </button>
      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <span
            aria-hidden="true"
            className="ui-pagination__ellipsis"
            key={`ellipsis-${index}`}
          >
            …
          </span>
        ) : (
          <button
            aria-current={item === safeCurrentPage ? 'page' : undefined}
            aria-label={`Ir a la página ${item}`}
            className="ui-pagination__button"
            disabled={disabled}
            key={item}
            onClick={() => onPageChange(item)}
            type="button"
          >
            {item}
          </button>
        ),
      )}
      <button
        aria-label="Ir a la página siguiente"
        className="ui-pagination__button"
        disabled={disabled || safeCurrentPage === totalPages}
        onClick={() => onPageChange(safeCurrentPage + 1)}
        type="button"
      >
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  )
}
