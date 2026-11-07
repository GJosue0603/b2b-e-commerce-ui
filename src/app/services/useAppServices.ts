import { useContext } from 'react'
import { ServicesContext } from './services-context'

export function useAppServices() {
  const services = useContext(ServicesContext)
  if (!services) {
    throw new Error('useAppServices requiere AppServicesProvider.')
  }
  return services
}
