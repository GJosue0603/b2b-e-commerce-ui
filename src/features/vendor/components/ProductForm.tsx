import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { Categoria, Producto } from '../../../domain'
import type { ProductInput } from '../../../services'
import { Alert, Button, Select, Textarea, TextField } from '../../../shared/ui'
import { validateProductInput, type ProductFormErrors } from './product-validation'

export interface ProductFormProps {
  readonly categories: readonly Categoria[]
  readonly initialProduct?: Producto
  readonly onCancel: () => void
  readonly onSubmit: (input: ProductInput) => Promise<void>
  readonly submitLabel: string
}

export function ProductForm({
  categories,
  initialProduct,
  onCancel,
  onSubmit,
  submitLabel,
}: ProductFormProps) {
  const [nombre, setNombre] = useState(initialProduct?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(initialProduct?.descripcion ?? '')
  const [categoriaId, setCategoriaId] = useState(initialProduct?.categoriaId ?? '')
  const [precioRegular, setPrecioRegular] = useState(String(initialProduct?.precioRegular ?? ''))
  const [precioPyme, setPrecioPyme] = useState(String(initialProduct?.precioPyme ?? ''))
  const [existencias, setExistencias] = useState(String(initialProduct?.existencias ?? ''))
  const [imagenUrl, setImagenUrl] = useState(initialProduct?.imagenUrl ?? '')
  const [activo, setActivo] = useState(initialProduct?.activo ?? true)
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const readImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') setImagenUrl(reader.result)
    })
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parseNumber = (value: string) => value.trim() === '' ? Number.NaN : Number(value)
    const input: ProductInput = {
      activo,
      categoriaId,
      descripcion,
      existencias: parseNumber(existencias),
      imagenUrl,
      nombre,
      precioPyme: parseNumber(precioPyme),
      precioRegular: parseNumber(precioRegular),
    }
    const nextErrors = validateProductInput(input)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(input)
    } catch {
      setSubmitError('No se pudo guardar el producto demostrativo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="vendor-product-form" noValidate onSubmit={handleSubmit}>
      {submitError && <Alert variant="danger">{submitError}</Alert>}
      <div className="vendor-product-form__main">
        <section className="vendor-panel">
          <h2>Información general</h2>
          <TextField error={errors.nombre} label="Nombre" onChange={(event) => setNombre(event.target.value)} required value={nombre} />
          <Select error={errors.categoriaId} label="Categoría" onChange={(event) => setCategoriaId(event.target.value)} required value={categoriaId}>
            <option value="">Selecciona una categoría</option>
            {categories.filter((category) => category.activo || category.id === categoriaId).map((category) => (
              <option key={category.id} value={category.id}>{category.nombre}</option>
            ))}
          </Select>
          <Textarea error={errors.descripcion} label="Descripción" onChange={(event) => setDescripcion(event.target.value)} required value={descripcion} />
        </section>
        <section className="vendor-panel">
          <h2>Imagen principal del producto</h2>
          <TextField error={errors.imagenUrl} label="URL o recurso local" onChange={(event) => setImagenUrl(event.target.value)} required value={imagenUrl} />
          <label className="vendor-image-picker">Seleccionar imagen local<input accept="image/*" onChange={readImage} type="file" /></label>
          <p className="vendor-help">La previsualización vive solo durante esta sesión.</p>
          {imagenUrl && <img alt="Previsualización del producto" className="vendor-image-preview" src={imagenUrl} />}
        </section>
      </div>

      <div className="vendor-product-form__aside">
        <section className="vendor-panel">
          <h2>Estructura de precios</h2>
          <div className="vendor-form-grid">
            <TextField error={errors.precioRegular} inputMode="numeric" label="Precio regular (₡)" min="0" onChange={(event) => setPrecioRegular(event.target.value)} required type="number" value={precioRegular} />
            <TextField error={errors.precioPyme} inputMode="numeric" label="Precio PYME (₡)" min="0" onChange={(event) => setPrecioPyme(event.target.value)} required type="number" value={precioPyme} />
            <TextField error={errors.existencias} inputMode="numeric" label="Existencias" min="0" onChange={(event) => setExistencias(event.target.value)} required step="1" type="number" value={existencias} />
          </div>
        </section>
        <section className="vendor-panel">
          <h2>Visibilidad y catálogo</h2>
          <label className="vendor-checkbox"><input checked={activo} onChange={(event) => setActivo(event.target.checked)} type="checkbox" />Producto activo en catálogo</label>
          <p className="vendor-help">Al desactivarlo se oculta de búsquedas, categorías y detalle público.</p>
        </section>
      </div>

      <div className="vendor-form-actions">
        <Button disabled={submitting} onClick={onCancel} variant="ghost">Cancelar</Button>
        <Button loading={submitting} type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
