import type { FiltroReporteVentas, TipoPeriodoReporte, TrimestreReporte } from '../../../domain'
import { Select } from '../../../shared/ui'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const

export interface ReportFilterBarProps {
  readonly filter: FiltroReporteVentas
  readonly onChange: (filter: FiltroReporteVentas) => void
  readonly years: readonly number[]
}

export function ReportFilterBar({ filter, onChange, years }: ReportFilterBarProps) {
  const setPeriod = (periodo: TipoPeriodoReporte) => onChange({
    anio: filter.anio,
    periodo,
    ...(periodo === 'mensual' ? { mes: filter.mes ?? 1 } : {}),
    ...(periodo === 'trimestral' ? { trimestre: filter.trimestre ?? 1 } : {}),
  })

  return (
    <section aria-label="Filtros del reporte de ventas" className="report-filter-bar">
      <div aria-label="Tipo de período" className="report-filter-bar__periods" role="group">
        {([
          ['mensual', 'Mensual'],
          ['trimestral', 'Trimestral'],
          ['anual', 'Año completo'],
        ] as const).map(([value, label]) => (
          <button aria-pressed={filter.periodo === value} key={value} onClick={() => setPeriod(value)} type="button">{label}</button>
        ))}
      </div>
      <Select label="Año del reporte" onChange={(event) => onChange({ ...filter, anio: Number(event.target.value) })} value={filter.anio}>
        {years.map((year) => <option key={year} value={year}>{year}</option>)}
      </Select>
      {filter.periodo === 'mensual' && (
        <Select label="Mes" onChange={(event) => onChange({ ...filter, mes: Number(event.target.value) })} value={filter.mes ?? 1}>
          {MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
        </Select>
      )}
      {filter.periodo === 'trimestral' && (
        <Select label="Trimestre" onChange={(event) => onChange({ ...filter, trimestre: Number(event.target.value) as TrimestreReporte })} value={filter.trimestre ?? 1}>
          {[1, 2, 3, 4].map((quarter) => <option key={quarter} value={quarter}>Q{quarter}</option>)}
        </Select>
      )}
    </section>
  )
}
