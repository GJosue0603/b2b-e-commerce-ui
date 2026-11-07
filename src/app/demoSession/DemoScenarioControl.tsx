import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DemoScenarioId } from '../../services'
import { Alert, Badge, Button, Select, Skeleton } from '../../shared/ui'
import { useDemoSession } from './useDemoSession'

export function DemoScenarioControl() {
  const navigate = useNavigate()
  const { retry, selectScenario, state } = useDemoSession()

  if (!import.meta.env.DEV) return null

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const session = await selectScenario(event.target.value as DemoScenarioId)
    if (session) navigate(session.scenario.landingPath)
  }

  return (
    <details className="demo-scenario">
      <summary className="demo-scenario__summary">
        <span>Demo</span>
        {state.status === 'success' && (
          <Badge variant="primary">{state.data.session.scenario.label}</Badge>
        )}
      </summary>
      <div className="demo-scenario__panel">
        <strong>Sesión simulada</strong>
        <small>Solo visible durante el desarrollo.</small>

        {(state.status === 'idle' || state.status === 'loading') && (
          <Skeleton label="Cargando escenarios" lines={3} />
        )}

        {state.status === 'error' && (
          <Alert title="No se pudo cargar la demo" variant="danger">
            <p>{state.error.message}</p>
            <Button onClick={() => void retry()} size="sm" variant="secondary">
              Reintentar
            </Button>
          </Alert>
        )}

        {state.status === 'success' && (
          <>
            <Select
              label="Escenario de demostración"
              onChange={(event) => void handleChange(event)}
              value={state.data.session.scenario.id}
            >
              {state.data.scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </Select>
            <p className="demo-scenario__description">
              {state.data.session.scenario.description}
            </p>
            <div className="demo-scenario__status">
              <span>
                {state.data.session.user
                  ? `${state.data.session.user.nombre} · ${state.data.session.user.rol}`
                  : 'Sin usuario autenticado'}
              </span>
              {state.data.session.user?.rol === 'comprador' && (
                <Badge
                  variant={
                    state.data.session.pymePricingEnabled ? 'success' : 'neutral'
                  }
                >
                  {state.data.session.pymePricingEnabled
                    ? 'PrecioPyme habilitado'
                    : 'PrecioPyme no disponible'}
                </Badge>
              )}
            </div>
          </>
        )}
      </div>
    </details>
  )
}
