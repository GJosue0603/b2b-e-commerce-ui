import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { routePatterns } from '../../../app/router/paths'
import { useAppServices } from '../../../app/services'
import type { Categoria, Producto } from '../../../domain'
import type { ProductInput } from '../../../services'
import { Alert, Skeleton } from '../../../shared/ui'
import { ProductForm } from '../components'
import { createProduct } from '../usecases/createProduct'
import { updateProduct } from '../usecases/updateProduct'
import './vendor-pages.css'

export interface EditProductPageProps {
  readonly mode: 'create' | 'edit'
}

export function EditProductPage({ mode }: EditProductPageProps) {
  const { catalog } = useAppServices()
  const navigate = useNavigate()
  const { productId } = useParams()
  const [categories, setCategories] = useState<readonly Categoria[]>([])
  const [product, setProduct] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    void (async () => {
      const [nextCategories, products] = await Promise.all([
        catalog.listManagedCategories(),
        mode === 'edit' ? catalog.listManagedProducts() : Promise.resolve([]),
      ])
      if (!active) return
      setCategories(nextCategories)
      if (mode === 'edit') {
        const found = products.find((item) => item.id === productId) ?? null
        setProduct(found)
        setNotFound(!found)
      }
      setLoading(false)
    })()
    return () => { active = false }
  }, [catalog, mode, productId])

  const handleSubmit = async (input: ProductInput) => {
    if (mode === 'create') {
      await createProduct(catalog, input)
    } else if (productId) {
      await updateProduct(catalog, productId, input)
    }
    navigate(`${routePatterns.sellerProducts}?guardado=${mode === 'create' ? 'creado' : 'editado'}`)
  }

  if (loading) return <Skeleton height="28rem" />
  if (notFound) return <Alert variant="danger">El producto solicitado no existe en el catálogo demo.</Alert>

  return (
    <section className="vendor-page">
      <header className="vendor-page__header">
        <div>
          <span className="vendor-eyebrow">Catálogo compartido</span>
          <h1 aria-label={mode === 'create' ? undefined : `Editar: ${product?.nombre ?? ''}`}>
            {mode === 'create' ? 'Nuevo producto' : `Editar producto: ${product?.nombre ?? ''}`}
          </h1>
          <p>Configura datos, precios, inventario, imagen y visibilidad en catálogo.</p>
        </div>
      </header>
      <ProductForm
        categories={categories}
        initialProduct={product ?? undefined}
        onCancel={() => navigate(routePatterns.sellerProducts)}
        onSubmit={handleSubmit}
        submitLabel={mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
      />
    </section>
  )
}
