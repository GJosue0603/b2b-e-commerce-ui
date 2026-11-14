import { Pagination } from './Pagination'

interface TablePaginationProps {
  readonly currentPage: number
  readonly totalItems: number
  readonly pageSize: number
  readonly totalPages?: number
  readonly itemLabel: string
  readonly label: string
  readonly onPageChange: (page: number) => void
  readonly disabled?: boolean
}

export function TablePagination({ currentPage, totalItems, pageSize, totalPages, itemLabel, label, onPageChange, disabled }: TablePaginationProps) {
  const pages = Math.max(1, totalPages ?? Math.ceil(totalItems / pageSize))
  const page = Math.min(Math.max(1, currentPage), pages)
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="table-pagination">
      <span>Mostrando {start}–{end} de {totalItems} {itemLabel}</span>
      <Pagination currentPage={page} disabled={disabled} hideWhenSinglePage={false} label={label} onPageChange={onPageChange} totalPages={pages} />
    </div>
  )
}
