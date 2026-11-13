import type { Key, ReactNode } from 'react'

export interface DataTableColumn<Row> {
  readonly align?: 'left' | 'center' | 'right'
  readonly header: ReactNode
  readonly id: string
  readonly render: (row: Row) => ReactNode
}

export interface DataTableProps<Row> {
  readonly caption: string
  readonly columns: readonly DataTableColumn<Row>[]
  readonly getRowKey: (row: Row) => Key
  readonly rows: readonly Row[]
}

export function DataTable<Row>({
  caption,
  columns,
  getRowKey,
  rows,
}: DataTableProps<Row>) {
  return (
    <div className="ui-data-table__scroll" tabIndex={0}>
      <table className="ui-data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className={`ui-data-table__cell--${column.align ?? 'left'}`}
                key={column.id}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td
                  className={`ui-data-table__cell--${column.align ?? 'left'}`}
                  key={column.id}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
