import { useEffect, useState } from 'react'
import { useAppServices } from '../../../app/services'
import type { AsyncState, DemoAccessProfile } from '../../../services'

export function useDemoAccessProfiles() {
  const { demoAuth } = useAppServices()
  const [state, setState] = useState<
    AsyncState<readonly DemoAccessProfile[]>
  >({ status: 'idle' })

  useEffect(() => {
    const controller = new AbortController()
    void demoAuth
      .listAccessProfiles({ signal: controller.signal })
      .then((profiles) => {
        if (!controller.signal.aborted) {
          setState({ status: 'success', data: profiles })
        }
      })
      .catch((reason) => {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            error:
              reason instanceof Error
                ? reason
                : new Error('No fue posible cargar los accesos demo.'),
          })
        }
      })
    return () => controller.abort()
  }, [demoAuth])

  return state
}
