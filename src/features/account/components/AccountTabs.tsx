import { NavLink } from 'react-router-dom'
import { routePatterns } from '../../../app/router/paths'
import '../pages/account-page.css'

export function AccountTabs() {
  return (
    <nav aria-label="Secciones de mi cuenta" className="account-tabs">
      <NavLink end to={routePatterns.account}>Datos de perfil</NavLink>
      <NavLink to={routePatterns.orders}>Mis pedidos</NavLink>
      <NavLink to={routePatterns.accreditationStatus}>Acreditación PYME</NavLink>
    </nav>
  )
}
