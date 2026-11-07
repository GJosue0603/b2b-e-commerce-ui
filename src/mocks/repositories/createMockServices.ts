import type {
  AcreditacionPyme,
  EntityId,
  Usuario,
} from '../../domain'
import { isAccreditationValid } from '../../domain'
import {
  RepositoryError,
  type AppServices,
  type DemoScenario,
  type DemoScenarioId,
  type DemoSession,
} from '../../services'
import {
  acreditacionesPyme,
  carritos,
  categorias,
  fixtureIds,
  inventario,
  pagos,
  pedidos,
  productos,
  reportes,
  solicitudesPyme,
  usuarios,
} from '../fixtures'
import {
  createMockRequest,
  type MockRepositoryConfig,
} from './mock-request'

const DEMO_REFERENCE_DATE = new Date('2026-11-07T12:00:00.000-06:00')

const demoScenarios = [
  {
    id: 'visitor',
    label: 'Visitante',
    description: 'Navegación pública sin una sesión iniciada.',
    landingPath: '/',
  },
  {
    id: 'buyer-regular',
    label: 'Comprador normal',
    description: 'Comprador sin acreditación PYME.',
    landingPath: '/mi-cuenta',
  },
  {
    id: 'buyer-pyme-active',
    label: 'Comprador PYME activo',
    description: 'Acreditación activa y vigente; PrecioPyme habilitado.',
    landingPath: '/acreditacion/estado',
  },
  {
    id: 'buyer-pyme-expired',
    label: 'Comprador PYME vencido',
    description: 'Acreditación vencida; PrecioPyme no disponible.',
    landingPath: '/acreditacion/estado',
  },
  {
    id: 'seller',
    label: 'Vendedor',
    description: 'Panel interno con navegación exclusiva de Vendedor.',
    landingPath: '/vendedor/productos',
  },
  {
    id: 'administrator',
    label: 'Administrador',
    description: 'Panel interno con navegación exclusiva de Administrador.',
    landingPath: '/admin/acreditaciones',
  },
] as const satisfies readonly DemoScenario[]

const scenarioUserIds: Record<DemoScenarioId, EntityId | null> = {
  visitor: null,
  'buyer-regular': fixtureIds.users.buyerRegular,
  'buyer-pyme-active': fixtureIds.users.buyerPymeActive,
  'buyer-pyme-expired': fixtureIds.users.buyerPymeExpired,
  seller: fixtureIds.users.seller,
  administrator: fixtureIds.users.administrator,
}

function findUser(userId: EntityId | null): Usuario | null {
  if (userId === null) return null
  return usuarios.find((user) => user.id === userId) ?? null
}

function findAccreditation(userId: EntityId | null): AcreditacionPyme | null {
  if (userId === null) return null
  return (
    acreditacionesPyme.find(
      (accreditation) => accreditation.usuarioId === userId,
    ) ?? null
  )
}

function buildDemoSession(scenarioId: DemoScenarioId): DemoSession {
  const scenario = demoScenarios.find((item) => item.id === scenarioId)
  if (!scenario) {
    throw new RepositoryError('El escenario solicitado no existe.', 'not_found')
  }

  const user = findUser(scenarioUserIds[scenarioId])
  if (scenarioUserIds[scenarioId] !== null && user === null) {
    throw new RepositoryError(
      'El usuario del escenario no existe en los datos demostrativos.',
      'not_found',
    )
  }

  const accreditation = findAccreditation(user?.id ?? null)
  return {
    scenario,
    user,
    accreditation,
    pymePricingEnabled: isAccreditationValid(
      accreditation,
      DEMO_REFERENCE_DATE,
    ),
    simulated: true,
  }
}

export function createMockServices(
  config: MockRepositoryConfig = {},
): AppServices {
  const request = createMockRequest(config)

  return {
    users: {
      getById: (id, options) =>
        request(
          'users.getById',
          usuarios.find((user) => user.id === id) ?? null,
          options,
        ),
      list: (options) => request('users.list', usuarios, options),
    },
    catalog: {
      getProductById: (id, options) =>
        request(
          'catalog.getProductById',
          productos.find((product) => product.id === id) ?? null,
          options,
        ),
      listCategories: (options) =>
        request('catalog.listCategories', categorias, options),
      listInventory: (options) =>
        request('catalog.listInventory', inventario, options),
      listProducts: (options) =>
        request('catalog.listProducts', productos, options),
    },
    commerce: {
      getCartByUser: (userId, options) =>
        request(
          'commerce.getCartByUser',
          carritos.find((cart) => cart.usuarioId === userId) ?? null,
          options,
        ),
      listOrdersByUser: (userId, options) =>
        request(
          'commerce.listOrdersByUser',
          pedidos.filter((order) => order.usuarioId === userId),
          options,
        ),
      listPaymentsByUser: (userId, options) =>
        request(
          'commerce.listPaymentsByUser',
          pagos.filter((payment) => payment.usuarioId === userId),
          options,
        ),
    },
    pyme: {
      getAccreditationByUser: (userId, options) =>
        request(
          'pyme.getAccreditationByUser',
          acreditacionesPyme.find(
            (accreditation) => accreditation.usuarioId === userId,
          ) ?? null,
          options,
        ),
      getRequestByUser: (userId, options) =>
        request(
          'pyme.getRequestByUser',
          solicitudesPyme.find((item) => item.usuarioId === userId) ?? null,
          options,
        ),
      listRequests: (options) =>
        request('pyme.listRequests', solicitudesPyme, options),
    },
    reports: {
      list: (options) => request('reports.list', reportes, options),
    },
    demoSession: {
      getByScenario: async (scenarioId, options) =>
        request(
          'demoSession.getByScenario',
          buildDemoSession(scenarioId),
          options,
        ),
      listScenarios: (options) =>
        request('demoSession.listScenarios', demoScenarios, options),
    },
  }
}
