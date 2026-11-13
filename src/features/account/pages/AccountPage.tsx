import { Link } from 'react-router-dom'
import { routePatterns } from '../../../app/router/paths'
import { Badge } from '../../../shared/ui'
import { AccountTabs, ProfileForm } from '../components'
import { useAuth } from '../../auth/state'
import './account-page.css'

export function AccountPage() {
  const { actionStatus, updateProfile, user } = useAuth()
  if (!user) return null

  return (
    <div className="container account-page">
      <AccountTabs />
      <header className="account-page__header">
        <div>
          <Badge variant="primary">Cuenta Comprador</Badge>
          <h1>Mi cuenta</h1>
          <p>Actualiza tus datos personales para compras y facturación.</p>
        </div>
        <Link className="account-page__orders" to={routePatterns.orders}>
          Ver mis pedidos
        </Link>
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
          <aside className="account-card account-card--pyme">
            <Badge variant="success">Beneficio opcional</Badge>
            <h2>Acreditación PYME</h2>
            <p>
              Consulta tu solicitud y vigencia. La acreditación no cambia tu rol
              Comprador.
            </p>
            <Link to={routePatterns.accreditationStatus}>
              Ver estado de acreditación <span aria-hidden="true">→</span>
            </Link>
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
