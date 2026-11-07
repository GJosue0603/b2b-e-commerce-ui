import { useContext } from 'react'
import { DemoSessionContext } from './demo-session-context'

export function useDemoSession() {
  const context = useContext(DemoSessionContext)
  if (!context) {
    throw new Error('useDemoSession requiere DemoSessionProvider.')
  }
  return context
}
