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
    email: 'marco.pendiente@nexotech.demo.test',
    label: 'Comprador PYME pendiente',
    password: 'CompradorPendiente123!',
    role: 'comprador',
    scenarioId: 'buyer-pyme-pending',
  },
  {
    email: 'natalia.rechazada@nexotech.demo.test',
    label: 'Comprador PYME rechazado',
    password: 'CompradorRechazado123!',
    role: 'comprador',
    scenarioId: 'buyer-pyme-rejected',
  },
  {
    email: 'sofia.revocada@nexotech.demo.test',
    label: 'Comprador PYME revocado',
    password: 'CompradorRevocado123!',
    role: 'comprador',
    scenarioId: 'buyer-pyme-revoked',
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
