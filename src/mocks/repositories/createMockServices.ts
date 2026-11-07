import type {
  AcreditacionPyme,
  Carrito,
  Categoria,
  EntityId,
  InventarioProducto,
  Pago,
  Pedido,
  Producto,
  SolicitudPyme,
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
  ventasReporteDemo,
} from '../fixtures'
import { colaboradores } from '../fixtures/usuarios'
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
    label: 'Comprador PYME',
    description: 'Comprador con acceso a la vista unificada de acreditación.',
    landingPath: '/acreditacion/estado',
  },
  {
    id: 'buyer-pyme-expired',
    label: 'Comprador PYME vencido',
    description: 'Acreditación vencida; PrecioPyme no disponible.',
    landingPath: '/acreditacion/estado',
  },
  {
    id: 'buyer-pyme-pending',
    label: 'Comprador PYME pendiente',
    description: 'Solicitud pendiente; PrecioPyme no disponible.',
    landingPath: '/acreditacion/estado',
  },
  {
    id: 'buyer-pyme-rejected',
    label: 'Comprador PYME rechazado',
    description: 'Solicitud rechazada; puede presentar una nueva.',
    landingPath: '/acreditacion/estado',
  },
  {
    id: 'buyer-pyme-revoked',
    label: 'Comprador PYME revocado',
    description: 'Acreditación revocada; PrecioPyme no disponible.',
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

const visibleDemoScenarioIds = new Set<DemoScenarioId>([
  'visitor',
  'buyer-regular',
  'buyer-pyme-active',
  'seller',
  'administrator',
])

const scenarioUserIds: Record<DemoScenarioId, EntityId | null> = {
  visitor: null,
  'buyer-regular': fixtureIds.users.buyerRegular,
  'buyer-pyme-active': fixtureIds.users.buyerPymeActive,
  'buyer-pyme-expired': fixtureIds.users.buyerPymeExpired,
  'buyer-pyme-pending': fixtureIds.users.buyerPymePending,
  'buyer-pyme-rejected': fixtureIds.users.buyerPymeRejected,
  'buyer-pyme-revoked': fixtureIds.users.buyerPymeRevoked,
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

function findAccreditation(
  userId: EntityId | null,
  accreditationStore: readonly AcreditacionPyme[] = acreditacionesPyme,
): AcreditacionPyme | null {
  if (userId === null) return null
  return [...accreditationStore]
    .filter((accreditation) => accreditation.usuarioId === userId)
    .sort((left, right) =>
      right.fechaInicio.localeCompare(left.fechaInicio),
    )[0] ?? null
}

function buildDemoSession(
  scenarioId: DemoScenarioId,
  userStore: readonly Usuario[] = usuarios,
  accreditationStore: readonly AcreditacionPyme[] = acreditacionesPyme,
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

  const accreditation = findAccreditation(
    user?.id ?? null,
    accreditationStore,
  )
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
  let submittedRequestSequence = 0
  let productSequence = 0
  let categorySequence = 0
  const requestStore: SolicitudPyme[] = solicitudesPyme.map((item) => ({
    ...item,
    documentos: [...item.documentos],
  }))
  const accreditationStore: AcreditacionPyme[] = acreditacionesPyme.map(
    (item) => ({
      ...item,
      solicitudPyme: {
        ...item.solicitudPyme,
        documentos: [...item.solicitudPyme.documentos],
      },
    }),
  )
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
  let categoryStore = categorias.map((category) => ({ ...category })) as Categoria[]
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
        const session = buildDemoSession(
          accessProfile.scenarioId,
          userStore,
          accreditationStore,
        )
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
      createCategory: async (input, options) => {
        await request('catalog.createCategory', null, options)
        const nombre = input.nombre.trim()
        const descripcion = input.descripcion.trim()
        if (!nombre || !descripcion) {
          throw new RepositoryError('Completa los campos requeridos.', 'conflict')
        }
        categorySequence += 1
        const category: Categoria = {
          ...input,
          nombre,
          descripcion,
          id: `demo-categoria-${categorySequence}`,
          creadoPor: colaboradores.vendedor,
          fechaCreacion: '2026-11-07T20:00:00.000Z',
        }
        categoryStore = [...categoryStore, category]
        return structuredClone(category)
      },
      createProduct: async (input, options) => {
        await request('catalog.createProduct', null, options)
        if (!categoryStore.some((category) => category.id === input.categoriaId)) {
          throw new RepositoryError('La categoría seleccionada no existe.', 'not_found')
        }
        if (
          !input.nombre.trim() ||
          !input.descripcion.trim() ||
          !input.imagenUrl.trim() ||
          input.precioRegular < 0 ||
          input.precioPyme < 0 ||
          !Number.isInteger(input.existencias) ||
          input.existencias < 0
        ) {
          throw new RepositoryError('Los datos del producto no son válidos.', 'conflict')
        }
        productSequence += 1
        const product: Producto = {
          ...input,
          nombre: input.nombre.trim(),
          descripcion: input.descripcion.trim(),
          imagenUrl: input.imagenUrl.trim(),
          id: `demo-producto-${productSequence}`,
          creadoPor: colaboradores.vendedor,
          fechaCreacion: '2026-11-07T20:00:00.000Z',
        }
        commerceStore.products.push(product)
        commerceStore.inventory.push({
          productoId: product.id,
          existencias: product.existencias,
          estado: product.existencias === 0 ? 'agotado' : product.existencias <= 5 ? 'bajo' : 'disponible',
          umbralBajo: 5,
          fechaActualizacion: '2026-11-07T20:00:00.000Z',
        })
        return structuredClone(product)
      },
      getProductById: (id, options) =>
        request(
          'catalog.getProductById',
          commerceStore.products.find(
            (product) =>
              product.id === id &&
              product.activo &&
              categoryStore.some(
                (category) => category.id === product.categoriaId && category.activo,
              ),
          ) ?? null,
          options,
        ),
      listCategories: (options) =>
        request(
          'catalog.listCategories',
          categoryStore.filter((category) => category.activo),
          options,
        ),
      listManagedCategories: (options) =>
        request('catalog.listManagedCategories', categoryStore, options),
      listManagedProducts: (options) =>
        request('catalog.listManagedProducts', commerceStore.products, options),
      listInventory: (options) =>
        request('catalog.listInventory', commerceStore.inventory, options),
      listProducts: (options) =>
        request(
          'catalog.listProducts',
          commerceStore.products.filter(
            (product) =>
              product.activo &&
              categoryStore.some(
                (category) => category.id === product.categoriaId && category.activo,
              ),
          ),
          options,
        ),
      setCategoryActive: async (id, active, options) => {
        await request('catalog.setCategoryActive', null, options)
        const current = categoryStore.find((category) => category.id === id)
        if (!current) {
          throw new RepositoryError('La categoría no existe.', 'not_found')
        }
        const updated: Categoria = {
          ...current,
          activo: active,
          modificadoPor: colaboradores.vendedor,
          fechaModificacion: '2026-11-07T20:00:00.000Z',
        }
        categoryStore = categoryStore.map((category) =>
          category.id === id ? updated : category,
        )
        return structuredClone(updated)
      },
      setProductActive: async (id, active, options) => {
        await request('catalog.setProductActive', null, options)
        const current = commerceStore.products.find((product) => product.id === id)
        if (!current) {
          throw new RepositoryError('El producto no existe.', 'not_found')
        }
        const updated: Producto = {
          ...current,
          activo: active,
          modificadoPor: colaboradores.vendedor,
          fechaModificacion: '2026-11-07T20:00:00.000Z',
        }
        commerceStore.products = commerceStore.products.map((product) =>
          product.id === id ? updated : product,
        )
        return structuredClone(updated)
      },
      updateCategory: async (id, input, options) => {
        await request('catalog.updateCategory', null, options)
        const current = categoryStore.find((category) => category.id === id)
        if (!current) {
          throw new RepositoryError('La categoría no existe.', 'not_found')
        }
        if (!input.nombre.trim() || !input.descripcion.trim()) {
          throw new RepositoryError('Completa los campos requeridos.', 'conflict')
        }
        const updated: Categoria = {
          ...current,
          ...input,
          nombre: input.nombre.trim(),
          descripcion: input.descripcion.trim(),
          modificadoPor: colaboradores.vendedor,
          fechaModificacion: '2026-11-07T20:00:00.000Z',
        }
        categoryStore = categoryStore.map((category) =>
          category.id === id ? updated : category,
        )
        return structuredClone(updated)
      },
      updateProduct: async (id, input, options) => {
        await request('catalog.updateProduct', null, options)
        const current = commerceStore.products.find((product) => product.id === id)
        if (!current) {
          throw new RepositoryError('El producto no existe.', 'not_found')
        }
        if (
          !input.nombre.trim() ||
          !input.descripcion.trim() ||
          !input.imagenUrl.trim() ||
          input.precioRegular < 0 ||
          input.precioPyme < 0 ||
          !Number.isInteger(input.existencias) ||
          input.existencias < 0
        ) {
          throw new RepositoryError('Los datos del producto no son válidos.', 'conflict')
        }
        const updated: Producto = {
          ...current,
          ...input,
          nombre: input.nombre.trim(),
          descripcion: input.descripcion.trim(),
          imagenUrl: input.imagenUrl.trim(),
          modificadoPor: colaboradores.vendedor,
          fechaModificacion: '2026-11-07T20:00:00.000Z',
        }
        commerceStore.products = commerceStore.products.map((product) =>
          product.id === id ? updated : product,
        )
        commerceStore.inventory = commerceStore.inventory.map((entry) =>
          entry.productoId === id
            ? {
                ...entry,
                existencias: updated.existencias,
                estado: updated.existencias === 0 ? 'agotado' : updated.existencias <= entry.umbralBajo ? 'bajo' : 'disponible',
                fechaActualizacion: '2026-11-07T20:00:00.000Z',
              }
            : entry,
        )
        return structuredClone(updated)
      },
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
      getAccreditationsByUser: (userId, options) =>
        request(
          'pyme.getAccreditationsByUser',
          accreditationStore.filter((item) => item.usuarioId === userId),
          options,
        ),
      getAccreditationByUser: (userId, options) =>
        request(
          'pyme.getAccreditationByUser',
          findAccreditation(userId, accreditationStore),
          options,
        ),
      getRequestByUser: (userId, options) =>
        request(
          'pyme.getRequestByUser',
          [...requestStore]
            .filter((item) => item.usuarioId === userId)
            .sort((left, right) =>
              right.fechaSolicitud.localeCompare(left.fechaSolicitud),
            )[0] ?? null,
          options,
        ),
      listRequestsByUser: (userId, options) =>
        request(
          'pyme.listRequestsByUser',
          requestStore
            .filter((item) => item.usuarioId === userId)
            .sort((left, right) =>
              right.fechaSolicitud.localeCompare(left.fechaSolicitud),
            ),
          options,
        ),
      listRequests: (options) =>
        request('pyme.listRequests', requestStore, options),
      submitRequest: async (input, options) => {
        await request('pyme.submitRequest', null, options)
        const buyer = userStore.find(
          (user) => user.id === input.usuarioId && user.rol === 'comprador',
        )
        if (!buyer) {
          throw new RepositoryError(
            'Solo un Comprador registrado puede enviar la solicitud.',
            'not_found',
          )
        }
        if (
          requestStore.some(
            (item) =>
              item.usuarioId === input.usuarioId && item.estado === 'pendiente',
          )
        ) {
          throw new RepositoryError(
            'Ya existe una solicitud pendiente de revisión.',
            'conflict',
          )
        }
        if (
          accreditationStore.some(
            (item) =>
              item.usuarioId === input.usuarioId &&
              isAccreditationValid(item, DEMO_REFERENCE_DATE),
          )
        ) {
          throw new RepositoryError(
            'Ya existe una acreditación activa y vigente.',
            'conflict',
          )
        }
        const nombreComercial = input.nombreComercial.trim()
        const identificacionNegocio = input.identificacionNegocio.trim()
        const actividadEconomica = input.actividadEconomica.trim()
        const documentos = input.documentos.map((item) => item.trim()).filter(Boolean)
        if (
          !nombreComercial ||
          !identificacionNegocio ||
          !actividadEconomica ||
          documentos.length === 0
        ) {
          throw new RepositoryError(
            'La solicitud demostrativa está incompleta.',
            'conflict',
          )
        }
        submittedRequestSequence += 1
        const submitted: SolicitudPyme = {
          id: `demo-solicitud-enviada-${submittedRequestSequence}`,
          usuarioId: input.usuarioId,
          nombreComercial,
          identificacionNegocio,
          actividadEconomica,
          documentos,
          estado: 'pendiente',
          fechaSolicitud: '2026-11-07T19:00:00.000Z',
        }
        requestStore.push(submitted)
        return structuredClone(submitted)
      },
    },
    reports: {
      getSalesDataset: (options) =>
        request(
          'reports.getSalesDataset',
          {
            categorias: categoryStore,
            demostrativo: true,
            generadoEn: '2026-11-07T20:00:00.000Z',
            productos: commerceStore.products,
            ventas: ventasReporteDemo,
          },
          options,
        ),
      list: (options) => request('reports.list', reportes, options),
    },
    demoSession: {
      getByScenario: async (scenarioId, options) =>
        request(
          'demoSession.getByScenario',
          buildDemoSession(scenarioId, userStore, accreditationStore),
          options,
        ),
      listScenarios: (options) =>
        request(
          'demoSession.listScenarios',
          demoScenarios.filter((scenario) =>
            visibleDemoScenarioIds.has(scenario.id),
          ),
          options,
        ),
    },
  }
}
