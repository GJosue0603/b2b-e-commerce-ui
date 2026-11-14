import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import type { RolUsuario } from '../../../domain'
import { routePatterns } from '../../../app/router/paths'
import { Alert, Skeleton } from '../../../shared/ui'
import { canAccessRole } from '../../../shared/navigation'
import { useAuth } from '../state'

export interface ProtectedRouteProps {
  readonly allowedRoles: readonly RolUsuario[]
  readonly children: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const location = useLocation()
  const { authMode, status, user } = useAuth()

  if (status === 'loading') {
    return (
      <main className="container route-access-state" aria-label="Verificando acceso">
        <Skeleton height="12rem" />
      </main>
    )
  }

  if (!user) {
    return (
      <Navigate
        replace
        state={{ from: `${location.pathname}${location.search}` }}
        to={routePatterns.signIn}
      />
    )
  }

  if (!canAccessRole(user.rol, allowedRoles)) {
    return (
      <main className="container route-access-state">
        <Alert title="Acceso restringido" variant="warning">
          <p>Tu sesión no tiene permisos para consultar esta sección.</p>
          {authMode === 'api' && (
            <p>El backend también debe validar el token y autorizar cada operación.</p>
          )}
          <Link to={routePatterns.home}>Volver a la tienda</Link>
        </Alert>
        {authMode === 'demo' && (
          <p>
            Esta protección es visual y demostrativa. La autorización definitiva
            será responsabilidad del backend .NET.
          </p>
        )}
      </main>
    )
  }

  return children
}
