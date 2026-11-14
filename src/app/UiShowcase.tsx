import { useState, type ReactNode } from 'react'
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Textarea,
  TextField,
} from '../shared/ui'
import './ui-showcase.css'

export function UiShowcase() {
  const [alertVisible, setAlertVisible] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [page, setPage] = useState(4)

  return (
    <main className="container showcase">
      <header className="showcase__intro">
        <Badge variant="primary">Stitch 00</Badge>
        <h1>Primitivas de NexoTech</h1>
        <p>Catálogo temporal de estados reutilizables y accesibles.</p>
      </header>

      <ShowcaseSection title="Botones">
        <div className="showcase__row">
          <Button>Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="ghost">Neutro</Button>
          <Button variant="danger">Eliminar</Button>
          <Button loading>Guardando</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Campos de formulario">
        <div className="showcase__grid">
          <TextField
            hint="Nunca compartiremos tu correo."
            label="Correo electrónico"
            placeholder="nombre@empresa.com"
            required
            type="email"
          />
          <Select defaultValue="" label="Categoría" required>
            <option disabled value="">
              Selecciona una categoría
            </option>
            <option value="computadoras">Computadoras</option>
            <option value="accesorios">Accesorios</option>
          </Select>
          <Textarea
            error="Escribe al menos 10 caracteres."
            label="Comentario"
            placeholder="Cuéntanos qué necesitas"
          />
          <TextField label="Inventario" loading placeholder="Consultando…" />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Estados y avisos">
        <div className="showcase__row">
          <Badge>Normal</Badge>
          <Badge variant="success">PYME activa</Badge>
          <Badge variant="warning">Por vencer</Badge>
          <Badge variant="danger">Rechazada</Badge>
        </div>
        {alertVisible && (
          <Alert
            onDismiss={() => setAlertVisible(false)}
            title="Información demostrativa"
          >
            Estos estados pertenecen al catálogo local y no provienen de una API.
          </Alert>
        )}
        {confirmed && (
          <Alert title="Acción confirmada" variant="success">
            El resultado fue simulado dentro del ejemplo.
          </Alert>
        )}
      </ShowcaseSection>

      <ShowcaseSection title="Carga y ausencia de datos">
        <div className="showcase__grid">
          <div className="showcase__card">
            <Skeleton lines={3} />
          </div>
          <EmptyState
            action={<Button variant="ghost">Explorar productos</Button>}
            description="Cuando existan productos guardados aparecerán en este espacio."
            icon="◇"
            title="Aún no hay favoritos"
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Diálogos y paginación">
        <div className="showcase__row">
          <Button onClick={() => setModalOpen(true)} variant="ghost">
            Abrir modal
          </Button>
          <Button onClick={() => setConfirmOpen(true)} variant="danger">
            Abrir confirmación
          </Button>
        </div>
        <Pagination currentPage={page} onPageChange={setPage} totalPages={12} />
      </ShowcaseSection>

      <Modal
        description="Ejemplo reutilizable sin reglas de negocio."
        footer={<Button onClick={() => setModalOpen(false)}>Entendido</Button>}
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title="Detalle del componente"
      >
        <p>El diálogo usa el elemento nativo y admite cierre con Escape.</p>
      </Modal>

      <ConfirmDialog
        destructive
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          setConfirmed(true)
        }}
        open={confirmOpen}
        title="¿Confirmar la acción?"
      >
        Esta demostración no elimina ni modifica datos reales.
      </ConfirmDialog>
    </main>
  )
}

interface ShowcaseSectionProps {
  children: ReactNode
  title: string
}

function ShowcaseSection({ children, title }: ShowcaseSectionProps) {
  return (
    <section className="showcase__section">
      <h2>{title}</h2>
      <div className="showcase__content">{children}</div>
    </section>
  )
}
