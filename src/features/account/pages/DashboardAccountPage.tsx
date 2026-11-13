import { useAuth } from '../../auth/state'
import { ProfileForm } from '../components'
import { getRoleLabel } from '../../../shared/navigation'
import { Badge } from '../../../shared/ui'
import './account-page.css'

export function DashboardAccountPage() {
  const { actionStatus, updateProfile, user } = useAuth()
  if (!user || user.rol === 'comprador') return null

  const roleLabel = getRoleLabel(user.rol)

  return (
    <div className="container account-page dashboard-account-page">
      <header className="account-page__header">
        <div>
          <h1 className="dashboard-page-title">Mi cuenta</h1>
          <p>Actualiza tus datos personales y de contacto.</p>
        </div>
      </header>

      <div className="account-page__layout">
        <section className="account-card" aria-labelledby="profile-title">
          <h2 id="profile-title">Datos Personales y de Contacto</h2>
          <ProfileForm
            key={user.id}
            loading={actionStatus === 'loading'}
            onSave={updateProfile}
            user={user}
          />
        </section>
        <div className="account-page__aside">
          <aside className="account-card account-card--role">
            <Badge variant={user.rol === 'administrador' ? 'primary' : 'success'}>
              Acceso de {roleLabel}
            </Badge>
            <h2>Perfil de trabajo</h2>
            <p>
              Esta cuenta tiene acceso al dashboard y las herramientas de
              gestión de {roleLabel.toLocaleLowerCase('es')} de NexoTech.
            </p>
          </aside>
          <aside className="account-card account-card--security">
            <span>♢</span>
            <div>
              <h2>Seguridad de la cuenta</h2>
              <p>Protección de datos, contraseña y métodos de acceso.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
