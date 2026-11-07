import { Link } from 'react-router-dom'
import { paths, routePatterns } from '../../../app/router/paths'
import { Alert, EmptyState, Skeleton } from '../../../shared/ui'
import { ProductCard } from '../components/ProductCard'
import { useHomeCatalog, type HomeCatalogData } from '../hooks/useHomeCatalog'
import './home-page.css'

export function HomePage() {
  const catalogState = useHomeCatalog()

  return (
    <div className="home-page">
      <HomeHero />
      <div className="container home-page__content">
        {catalogState.status === 'loading' && <HomeCatalogSkeleton />}
        {catalogState.status === 'error' && (
          <Alert title="No pudimos cargar el catálogo" variant="danger">
            Intenta nuevamente dentro de unos instantes.
          </Alert>
        )}
        {catalogState.status === 'success' && (
          <HomeCatalogSections data={catalogState.data} />
        )}
        <PymeInvitation />
      </div>
    </div>
  )
}

function HomeHero() {
  return (
    <section className="home-hero">
      <div className="container home-hero__grid">
        <div className="home-hero__content">
          <span className="home-eyebrow">Garantía oficial y soporte técnico</span>
          <h1>Tecnología para tu día a día y tu negocio</h1>
          <p>
            Equipamiento tecnológico seleccionado para hogar, estudio y entornos
            de trabajo, con entrega ágil y atención local.
          </p>
          <div className="home-hero__actions">
            <Link className="home-cta home-cta--primary" to={routePatterns.catalog}>
              Explorar productos <span aria-hidden="true">→</span>
            </Link>
            <span>Envíos ágiles en Costa Rica</span>
          </div>
          <dl className="home-hero__facts">
            <div>
              <dt>100%</dt>
              <dd>Productos originales</dd>
            </div>
            <div>
              <dt>24–48h</dt>
              <dd>Entrega estimada</dd>
            </div>
            <div>
              <dt>₡ Colones</dt>
              <dd>Facturación formal</dd>
            </div>
          </dl>
        </div>
        <div aria-hidden="true" className="home-hero__artwork">
          <div className="home-hero__screen">
            <span />
            <span />
            <span />
          </div>
          <div className="home-hero__laptop" />
          <div className="home-hero__artwork-label">
            <span>Configuraciones de alto rendimiento</span>
            <strong>NexoTech Curated</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomeCatalogSections({ data }: { readonly data: HomeCatalogData }) {
  const categoryNames = new Map(
    data.categories.map((category) => [category.id, category.nombre]),
  )

  if (data.categories.length === 0 && data.featuredProducts.length === 0) {
    return (
      <EmptyState
        action={
          <Link className="home-cta home-cta--primary" to={routePatterns.catalog}>
            Ir al catálogo
          </Link>
        }
        description="Los productos demostrativos aparecerán aquí cuando estén disponibles."
        icon="◇"
        title="El catálogo está vacío"
      />
    )
  }

  return (
    <>
      <section aria-labelledby="home-categories-title" className="home-section">
        <div className="home-section__heading">
          <div>
            <span className="home-section__eyebrow">Exploración rápida</span>
            <h2 id="home-categories-title">Navegación por categorías</h2>
          </div>
          <Link to={routePatterns.catalog}>Ver todas las categorías →</Link>
        </div>
        {data.categories.length > 0 ? (
          <div className="home-categories">
            {data.categories.map((category) => (
              <Link
                className="home-category"
                key={category.id}
                to={paths.catalogWithFilters({ categoryId: category.id })}
              >
                <span aria-hidden="true">{category.nombre.slice(0, 1)}</span>
                <strong>{category.nombre}</strong>
                <small>{category.descripcion}</small>
              </Link>
            ))}
          </div>
        ) : (
          <p>No hay categorías disponibles por el momento.</p>
        )}
      </section>

      <section aria-labelledby="featured-products-title" className="home-section">
        <div className="home-section__heading home-section__heading--products">
          <div>
            <span className="home-section__eyebrow home-section__eyebrow--primary">
              Selección de hardware
            </span>
            <h2 id="featured-products-title">Productos destacados</h2>
          </div>
          <p>
            Dispositivos seleccionados con disponibilidad y soporte técnico
            postventa.
          </p>
        </div>
        {data.featuredProducts.length > 0 ? (
          <div className="home-products">
            {data.featuredProducts.map((product) => (
              <ProductCard
                categoryName={categoryNames.get(product.categoriaId)}
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            description="No encontramos productos activos para destacar."
            icon="◇"
            title="Sin productos destacados"
          />
        )}
      </section>
    </>
  )
}

function PymeInvitation() {
  return (
    <section className="home-pyme" aria-labelledby="home-pyme-title">
      <div>
        <span>Programa corporativo</span>
        <h2 id="home-pyme-title">¿Tienes una PYME?</h2>
        <p>
          Solicita tu acreditación y accede a precios preferenciales en compras
          corporativas y equipamiento para tu equipo de trabajo.
        </p>
        <small>Beneficio exclusivo para cuentas de comprador verificadas.</small>
      </div>
      <div className="home-pyme__action">
        <Link className="home-cta home-cta--accent" to={routePatterns.accreditationRequest}>
          Solicitar acreditación PYME <span aria-hidden="true">→</span>
        </Link>
        <small>La validación de esta demo es simulada.</small>
      </div>
    </section>
  )
}

function HomeCatalogSkeleton() {
  return (
    <div aria-label="Cargando contenido de inicio" className="home-loading">
      <Skeleton height="7rem" />
      <div className="home-products">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton height="20rem" key={index} />
        ))}
      </div>
    </div>
  )
}
