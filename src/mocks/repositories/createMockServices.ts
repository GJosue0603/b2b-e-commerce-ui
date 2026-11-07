import type {
  AcreditacionPyme,
  Carrito,
  EntityId,
  InventarioProducto,
  Pago,
  Pedido,
  Producto,
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
  demoAccessProfiles,
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
import { createMockPaymentGateway } from '../paymentGateway'
import { createMockOrderRepository } from '../orderRepository'

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

function findUser(
  userId: EntityId | null,
  userStore: readonly Usuario[] = usuarios,
): Usuario | null {
  if (userId === null) return null
  return userStore.find((user) => user.id === userId) ?? null
}

function findAccreditation(userId: EntityId | null): AcreditacionPyme | null {
  if (userId === null) return null
  return (
    acreditacionesPyme.find(
      (accreditation) => accreditation.usuarioId === userId,
    ) ?? null
  )
}

function buildDemoSession(
  scenarioId: DemoScenarioId,
  userStore: readonly Usuario[] = usuarios,
): DemoSession {
  const scenario = demoScenarios.find((item) => item.id === scenarioId)
  if (!scenario) {
    throw new RepositoryError('El escenario solicitado no existe.', 'not_found')
  }

  const user = findUser(scenarioUserIds[scenarioId], userStore)
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
  let userStore: Usuario[] = [...usuarios]
  let registeredBuyerSequence = 0
  const paymentStore: Pago[] = pagos.map((payment) => ({ ...payment }))
  const commerceStore = {
    carts: carritos.map((cart) => ({
      ...cart,
      items: cart.items.map((item) => ({ ...item })),
    })) as Carrito[],
    inventory: inventario.map((entry) => ({ ...entry })) as InventarioProducto[],
    orders: pedidos.map((order) => ({
      ...order,
      items: order.items.map((item) => ({ ...item })),
    })) as Pedido[],
    products: productos.map((product) => ({ ...product })) as Producto[],
  }
  const paymentGateway = createMockPaymentGateway(request, {
    attempts: new Map(),
    payments: paymentStore,
  })
  const orderRepository = createMockOrderRepository(request, commerceStore)

  return {
    demoAuth: {
      authenticate: async (credentials, options) => {
        await request('demoAuth.authenticate', null, options)
        const email = credentials.email.trim().toLocaleLowerCase('es')
        const accessProfile = demoAccessProfiles.find(
          (profile) =>
            profile.email.toLocaleLowerCase('es') === email &&
            profile.password === credentials.password,
        )
        if (!accessProfile) return null
        const session = buildDemoSession(accessProfile.scenarioId, userStore)
        return session.user
          ? { scenarioId: accessProfile.scenarioId, user: session.user }
          : null
      },
      listAccessProfiles: (options) =>
        request('demoAuth.listAccessProfiles', demoAccessProfiles, options),
    },
    users: {
      createBuyer: async (input, options) => {
        await request('users.createBuyer', null, options)
        const normalizedEmail = input.correo.trim().toLocaleLowerCase('es')
        if (
          userStore.some(
            (user) => user.correo.toLocaleLowerCase('es') === normalizedEmail,
          )
        ) {
          throw new RepositoryError(
            'Ya existe una cuenta con ese correo electrónico.',
            'conflict',
          )
        }
        registeredBuyerSequence += 1
        const buyer: Usuario = {
          ...input,
          correo: normalizedEmail,
          id: `demo-usuario-registrado-${registeredBuyerSequence}`,
          rol: 'comprador',
          activo: true,
          fechaCreacion: '2026-11-07T18:00:00.000Z',
        }
        userStore = [...userStore, buyer]
        return structuredClone(buyer)
      },
      getByEmail: (email, options) =>
        request(
          'users.getByEmail',
          userStore.find(
            (user) =>
              user.correo.toLocaleLowerCase('es') ===
              email.trim().toLocaleLowerCase('es'),
          ) ?? null,
          options,
        ),
      getById: (id, options) =>
        request(
          'users.getById',
          userStore.find((user) => user.id === id) ?? null,
          options,
        ),
      list: (options) => request('users.list', userStore, options),
      updateProfile: async (id, input, options) => {
        await request('users.updateProfile', null, options)
        const current = userStore.find((user) => user.id === id)
        if (!current) {
          throw new RepositoryError('El usuario no existe.', 'not_found')
        }
        const normalizedEmail = input.correo.trim().toLocaleLowerCase('es')
        if (
          userStore.some(
            (user) =>
              user.id !== id &&
              user.correo.toLocaleLowerCase('es') === normalizedEmail,
          )
        ) {
          throw new RepositoryError(
            'Ya existe otra cuenta con ese correo electrónico.',
            'conflict',
          )
        }
        const updated: Usuario = {
          ...current,
          ...input,
          correo: normalizedEmail,
        }
        userStore = userStore.map((user) => (user.id === id ? updated : user))
        return structuredClone(updated)
      },
    },
    catalog: {
      getProductById: (id, options) =>
        request(
          'catalog.getProductById',
          commerceStore.products.find((product) => product.id === id) ?? null,
          options,
        ),
      listCategories: (options) =>
        request('catalog.listCategories', categorias, options),
      listInventory: (options) =>
        request('catalog.listInventory', commerceStore.inventory, options),
      listProducts: (options) =>
        request('catalog.listProducts', commerceStore.products, options),
    },
    commerce: {
      getCartByUser: (userId, options) =>
        request(
          'commerce.getCartByUser',
          commerceStore.carts.find((cart) => cart.usuarioId === userId) ?? null,
          options,
        ),
      listOrdersByUser: (userId, options) =>
        request(
          'commerce.listOrdersByUser',
          commerceStore.orders.filter((order) => order.usuarioId === userId),
          options,
        ),
      listPaymentsByUser: (userId, options) =>
        request(
          'commerce.listPaymentsByUser',
          paymentStore.filter((payment) => payment.usuarioId === userId),
          options,
        ),
    },
    orders: orderRepository,
    paymentGateway,
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
          buildDemoSession(scenarioId, userStore),
          options,
        ),
      listScenarios: (options) =>
        request('demoSession.listScenarios', demoScenarios, options),
    },
  }
}
