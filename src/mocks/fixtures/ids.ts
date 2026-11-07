export const fixtureIds = {
  users: {
    buyerRegular: 'demo-usuario-comprador-regular',
    buyerPymeActive: 'demo-usuario-comprador-pyme-activa',
    buyerPymeExpired: 'demo-usuario-comprador-pyme-vencida',
    buyerPymePending: 'demo-usuario-comprador-pyme-pendiente',
    buyerPymeRejected: 'demo-usuario-comprador-pyme-rechazada',
    buyerPymeRevoked: 'demo-usuario-comprador-pyme-revocada',
    seller: 'demo-usuario-vendedor',
    administrator: 'demo-usuario-administrador',
  },
  categories: {
    office: 'demo-categoria-accesorios-oficina',
    monitors: 'demo-categoria-monitores',
    audio: 'demo-categoria-audio',
    video: 'demo-categoria-videoconferencia',
  },
  products: {
    keyboard: 'demo-producto-teclado-mecanico',
    mouse: 'demo-producto-mouse-ergonomico',
    monitor: 'demo-producto-monitor-27',
    headphones: 'demo-producto-audifonos-inalambricos',
    webcam: 'demo-producto-webcam-full-hd',
  },
  requests: {
    active: 'demo-solicitud-pyme-aprobada-activa',
    expired: 'demo-solicitud-pyme-aprobada-vencida',
    pending: 'demo-solicitud-pyme-pendiente',
    rejected: 'demo-solicitud-pyme-rechazada',
    revoked: 'demo-solicitud-pyme-aprobada-revocada',
  },
  accreditations: {
    active: 'demo-acreditacion-pyme-activa',
    expired: 'demo-acreditacion-pyme-vencida',
    revoked: 'demo-acreditacion-pyme-revocada',
  },
  carts: {
    regular: 'demo-carrito-comprador-regular',
    pyme: 'demo-carrito-comprador-pyme',
    pymeExpired: 'demo-carrito-comprador-pyme-vencida',
    pymeRevoked: 'demo-carrito-comprador-pyme-revocada',
  },
  payments: {
    regularApproved: 'demo-pago-regular-aprobado',
    pymeApproved: 'demo-pago-pyme-aprobado',
    rejected: 'demo-pago-rechazado',
    canceled: 'demo-pago-cancelado',
  },
  orders: {
    regular: 'demo-pedido-regular',
    pyme: 'demo-pedido-pyme',
  },
  reports: {
    sales: 'demo-reporte-ventas-2026',
  },
} as const
