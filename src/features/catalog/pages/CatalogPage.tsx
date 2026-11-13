import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { AcreditacionPyme, Categoria, Producto } from '../../../domain'
import { paths } from '../../../app/router/paths'
import type { CartMutationResult } from '../../cart/state'
import {
  Alert,
  Button,
  EmptyState,
  Modal,
  Pagination,
  Select,
  Skeleton,
} from '../../../shared/ui'
import { filterCatalogProducts } from '../catalog-filtering'
import {
  clearCatalogFilters,
  parseCatalogQuery,
  patchCatalogQuery,
  type CatalogQueryPatch,
} from '../catalog-query'
import { CatalogFilters } from '../components/CatalogFilters'
import { CatalogActiveFilters, ProductCard } from '../components'
import { useCatalogData } from '../hooks/useCatalogData'
import './catalog-page.css'

export interface CatalogPageProps {
  readonly accreditation?: AcreditacionPyme | null
  readonly onAddToCart?: (
    product: Producto,
    quantity: number,
  ) => CartMutationResult
}

export function CatalogPage({ accreditation, onAddToCart }: CatalogPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const dataState = useCatalogData()
  const filters = parseCatalogQuery(searchParams)

  const updateFilters = (patch: CatalogQueryPatch) => {
    setSearchParams(patchCatalogQuery(searchParams, patch))
  }

  const clearFilters = () => setSearchParams(clearCatalogFilters(searchParams))

  return (
    <div className="container catalog-page">
      <header className="catalog-page__header">
        <div className="catalog-page__heading">
          <div>
            <h1>Catálogo de Tecnología</h1>
            <p>
              Equipamiento certificado para hogar, estudio y entornos
              profesionales con entrega en Costa Rica.
            </p>
          </div>
          <div className="catalog-page__metadata" aria-label="Información comercial">
            <span>San José, Costa Rica</span>
            <span>Precios en colones (₡)</span>
          </div>
        </div>
      </header>

      {dataState.status === 'loading' && <CatalogLoading />}
      {dataState.status === 'error' && (
        <Alert title="No pudimos cargar el catálogo" variant="danger">
          Intenta nuevamente dentro de unos instantes.
        </Alert>
      )}
      {dataState.status === 'success' && (
        <CatalogContent
          accreditation={accreditation}
          categories={dataState.data.categories}
          clearFilters={clearFilters}
          filters={filters}
          mobileFiltersOpen={mobileFiltersOpen}
          onCloseMobileFilters={() => setMobileFiltersOpen(false)}
          onOpenMobileFilters={() => setMobileFiltersOpen(true)}
          onAddToCart={onAddToCart}
          products={dataState.data.products}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          updateFilters={updateFilters}
        />
      )}
    </div>
  )
}

interface CatalogContentProps {
  readonly accreditation?: AcreditacionPyme | null
  readonly categories: readonly Categoria[]
  readonly clearFilters: () => void
  readonly filters: ReturnType<typeof parseCatalogQuery>
  readonly mobileFiltersOpen: boolean
  readonly onCloseMobileFilters: () => void
  readonly onOpenMobileFilters: () => void
  readonly onAddToCart?: CatalogPageProps['onAddToCart']
  readonly products: readonly Producto[]
  readonly searchParams: URLSearchParams
  readonly setSearchParams: ReturnType<typeof useSearchParams>[1]
  readonly updateFilters: (patch: CatalogQueryPatch) => void
}

function CatalogContent({
  accreditation,
  categories,
  clearFilters,
  filters,
  mobileFiltersOpen,
  onCloseMobileFilters,
  onOpenMobileFilters,
  onAddToCart,
  products,
  searchParams,
  setSearchParams,
  updateFilters,
}: CatalogContentProps) {
  const result = filterCatalogProducts(products, filters, accreditation)
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.nombre]),
  )

  const filtersElement = (
    <CatalogFilters
      categories={categories}
      filters={filters}
      onChange={updateFilters}
      onClear={clearFilters}
      onSubmit={onCloseMobileFilters}
    />
  )

  return (
    <div className="catalog-layout">
      <aside aria-label="Filtros del catálogo" className="catalog-sidebar">
        <div className="catalog-sidebar__filters">{filtersElement}</div>
        <div className="catalog-pyme-callout">
          <strong>¿Comprador empresarial?</strong>
          <p>
            Solicita la acreditación PYME desde tu cuenta para acceder a precios
            preferenciales durante su vigencia.
          </p>
          <Link to={paths.accreditationStatus}>Consultar acreditación PYME →</Link>
        </div>
      </aside>

      <section aria-labelledby="catalog-results-title" className="catalog-results">
        <div className="catalog-toolbar">
          <div>
            <h2 id="catalog-results-title" aria-live="polite">
              {result.totalItems === 1
                ? 'Mostrando 1 producto'
                : `Mostrando ${result.totalItems} productos`}
            </h2>
            <CatalogActiveFilters
              categoryName={categoryNames.get(filters.categoryId)}
              filters={filters}
              onChange={updateFilters}
            />
          </div>
          <Button
            className="catalog-mobile-filter-button"
            onClick={onOpenMobileFilters}
            variant="ghost"
          >
            Filtros
          </Button>
          <Select
            className="catalog-sort"
            label="Ordenar por"
            onChange={(event) =>
              updateFilters({
                sort: event.target.value as ReturnType<
                  typeof parseCatalogQuery
                >['sort'],
              })
            }
            value={filters.sort}
          >
            <option value="name-asc">Nombre: A–Z</option>
            <option value="name-desc">Nombre: Z–A</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
          </Select>
        </div>

        {result.totalItems === 0 ? (
          <EmptyState
            action={
              <Button onClick={clearFilters} variant="ghost">
                Limpiar filtros
              </Button>
            }
            description="Prueba una búsqueda más amplia o elimina algunos filtros."
            icon="◇"
            title="No encontramos productos"
          />
        ) : (
          <>
            <div className="catalog-grid">
              {result.items.map((product) => (
                <ProductCard
                  accreditation={accreditation}
                  categoryName={categoryNames.get(product.categoriaId)}
                  cta={
                    onAddToCart
                      ? {
                          kind: 'add-to-cart',
                          label: 'Agregar al carrito',
                          onClick: () => onAddToCart(product, 1),
                        }
                      : {
                          kind: 'detail',
                          label: 'Ver detalle',
                          to: paths.productDetail(product.id),
                        }
                  }
                  detailPath={paths.productDetail(product.id)}
                  image={{ alt: product.nombre, src: product.imagenUrl }}
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
            <Pagination
              currentPage={result.currentPage}
              label="Paginación del catálogo"
              onPageChange={(page) =>
                setSearchParams(
                  patchCatalogQuery(searchParams, { page }, false),
                )
              }
              totalPages={result.totalPages}
            />
          </>
        )}
      </section>

      <div className="catalog-mobile-filters">
        <Modal
          description="Combina búsqueda, categoría, precios y disponibilidad."
          onClose={onCloseMobileFilters}
          open={mobileFiltersOpen}
          size="sm"
          title="Filtrar productos"
        >
          {filtersElement}
        </Modal>
      </div>
    </div>
  )
}

function CatalogLoading() {
  return (
    <div aria-label="Cargando catálogo" className="catalog-loading">
      <Skeleton height="18rem" />
      <div className="catalog-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton height="22rem" key={index} />
        ))}
      </div>
    </div>
  )
}
