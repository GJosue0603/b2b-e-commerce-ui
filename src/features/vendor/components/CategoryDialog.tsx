import { useState, type FormEvent } from 'react'
import type { Categoria } from '../../../domain'
import type { CategoryInput } from '../../../services'
import { Button, Modal, Textarea, TextField } from '../../../shared/ui'

export interface CategoryDialogProps {
  readonly category: Categoria | null
  readonly loading: boolean
  readonly onClose: () => void
  readonly onSubmit: (input: CategoryInput) => Promise<void>
  readonly open: boolean
}

export function CategoryDialog({
  category,
  loading,
  onClose,
  onSubmit,
  open,
}: CategoryDialogProps) {
  const [name, setName] = useState(category?.nombre ?? '')
  const [description, setDescription] = useState(category?.descripcion ?? '')
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = {
      ...(!name.trim() ? { name: 'El nombre es obligatorio.' } : {}),
      ...(!description.trim() ? { description: 'La descripción es obligatoria.' } : {}),
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    await onSubmit({
      activo: category?.activo ?? true,
      descripcion: description,
      nombre: name,
    })
  }

  return (
    <Modal
      footer={
        <>
          <Button disabled={loading} onClick={onClose} variant="ghost">Cancelar</Button>
          <Button form="category-form" loading={loading} type="submit">{category ? 'Guardar cambios' : 'Crear categoría'}</Button>
        </>
      }
      onClose={onClose}
      open={open}
      title={category ? 'Editar categoría' : 'Nueva categoría'}
    >
      <form className="vendor-dialog-form" id="category-form" noValidate onSubmit={(event) => void handleSubmit(event)}>
        <TextField error={errors.name} label="Nombre" onChange={(event) => setName(event.target.value)} required value={name} />
        <Textarea error={errors.description} label="Descripción" onChange={(event) => setDescription(event.target.value)} required value={description} />
      </form>
    </Modal>
  )
}
