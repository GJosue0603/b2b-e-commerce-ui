import type { DemoAccessProfile } from '../../services'

export const demoAccessProfiles = [
  {
    email: 'camila.regular@nexotech.demo.test',
    label: 'Comprador regular',
    password: 'Comprador123!',
    role: 'comprador',
    scenarioId: 'buyer-regular',
  },
  {
    email: 'diego.pyme@nexotech.demo.test',
    label: 'Comprador PYME activo',
    password: 'CompradorPyme123!',
    role: 'comprador',
    scenarioId: 'buyer-pyme-active',
  },
  {
    email: 'vendedor@nexotech.demo.test',
    label: 'Vendedor',
    password: 'Vendedor123!',
    role: 'vendedor',
    scenarioId: 'seller',
  },
  {
    email: 'admin@nexotech.demo.test',
    label: 'Administrador',
    password: 'Admin123!',
    role: 'administrador',
    scenarioId: 'administrator',
  },
] as const satisfies readonly DemoAccessProfile[]
