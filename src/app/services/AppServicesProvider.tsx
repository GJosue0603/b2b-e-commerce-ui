import type { ReactNode } from 'react'
import type { AppServices } from '../../services'
import { ServicesContext } from './services-context'

export interface AppServicesProviderProps {
  readonly children: ReactNode
  readonly services: AppServices
}

export function AppServicesProvider({
  children,
  services,
}: AppServicesProviderProps) {
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  )
}
