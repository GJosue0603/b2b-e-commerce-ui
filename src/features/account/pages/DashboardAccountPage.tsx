import { useAuth } from '../../auth/state'
import { getRoleLabel } from '../../../shared/navigation'
import { Badge } from '../../../shared/ui'
import './account-page.css'

export function DashboardAccountPage() {
  const { user } = useAuth()
  if (!user || user.rol === 'comprador') return null

  const roleLabel = getRoleLabel(user.rol)

  return (
    <div className="container account-page dashboard-account-page">
      <header className="account-page__header">
        <div>
          <h1>Mi cuenta</h1>
          <p>Consulta tus datos personales y el acceso de tu cuenta.</p>
        </div>
        <Badge variant={user.rol === 'administrador' ? 'primary' : 'success'}>
          {roleLabel}
        </Badge>
      </header>

      <section
        aria-labelledby="dashboard-account-details-title"
        className="account-card"
      >
        <h2 id="dashboard-account-details-title">Datos de la cuenta</h2>
        <dl className="dashboard-account-page__details">
          <div>
            <dt>Nombre</dt>
            <dd>{user.nombre}</dd>
          </div>
          <div>
            <dt>Apellidos</dt>
            <dd>{user.apellidos}</dd>
          </div>
          <div>
            <dt>Correo electrónico</dt>
            <dd>{user.correo}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{user.telefono}</dd>
          </div>
          <div>
            <dt>Rol de acceso</dt>
            <dd>{roleLabel}</dd>
          </div>
          <div>
            <dt>Estado de la cuenta</dt>
            <dd>{user.activo ? 'Activa' : 'Inactiva'}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
