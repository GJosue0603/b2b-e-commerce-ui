import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shared/styles/tokens.css'
import './shared/styles/global.css'
import { App } from './app/App'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('No se encontró el elemento raíz de la aplicación.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
