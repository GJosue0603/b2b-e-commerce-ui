import { EmptyState, KpiCard, Skeleton } from '../../../shared/ui'
import { useManagedCatalog } from '../hooks/useManagedCatalog'
import './vendor-pages.css'

export function VendorReportsPage() {
  const { categories, loading, products } = useManagedCatalog()
  const activeProducts = products.filter((product) => product.activo)
  const inventoryUnits = activeProducts.reduce((total, product) => total + product.existencias, 0)

  return (
    <section className="vendor-page">
      <header className="vendor-page__header">
        <div>
          <span className="vendor-eyebrow">Datos ficticios para simulación</span>
          <h1>Reporte operativo del catálogo</h1>
          <p>Resumen derivado del mismo repositorio mock; no representa ventas ni cobros reales.</p>
        </div>
      </header>
      {loading ? <Skeleton height="12rem" /> : activeProducts.length === 0 ? (
        <EmptyState description="Activa al menos un producto para consultar el resumen." title="No hay datos activos" />
      ) : (
        <div className="vendor-kpis">
          <KpiCard label="Productos públicos" tone="success" value={activeProducts.length} />
          <KpiCard label="Unidades disponibles" value={inventoryUnits} />
          <KpiCard label="Categorías activas" value={categories.filter((category) => category.activo).length} />
        </div>
      )}
    </section>
  )
}
