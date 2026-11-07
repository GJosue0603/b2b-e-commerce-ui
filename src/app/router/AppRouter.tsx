import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routeDefinitions } from './routes'

const router = createBrowserRouter(routeDefinitions)

export function AppRouter() {
  return <RouterProvider router={router} />
}
