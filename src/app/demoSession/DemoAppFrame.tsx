import { Outlet } from 'react-router-dom'
import { DemoScenarioControl } from './DemoScenarioControl'

export function DemoAppFrame() {
  return (
    <>
      <Outlet />
      <DemoScenarioControl />
    </>
  )
}
