import { Link } from 'react-router-dom'
import { routePatterns } from '../../../app/router/paths'
import { Badge } from '../../../shared/ui'
import { ProfileForm } from '../components'
import { useAuth } from '../../auth/state'
import './account-page.css'

export function AccountPage() {
  const { actionStatus, updateProfile, user } = useAuth()
  if (!user) return null

  return (
    <div className="container account-page">
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
          <h2 id="profile-title">Datos personales</h2>
          <ProfileForm
            key={user.id}
            loading={actionStatus === 'loading'}
            onSave={updateProfile}
            user={user}
          />
        </section>
        <aside className="account-card account-card--pyme">
          <Badge variant="success">Beneficio opcional</Badge>
          <h2>Acreditación PYME</h2>
          <p>
            Consulta tu solicitud y vigencia. La acreditación no cambia tu rol
            Comprador.
          </p>
          <Link to={routePatterns.accreditationStatus}>Ver estado de acreditación</Link>
        </aside>
      </div>
    </div>
  )
}
