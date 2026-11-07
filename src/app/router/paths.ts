export const routePatterns = {
  home: '/',
  catalog: '/catalogo',
  productDetail: '/producto/:productId',
  cart: '/carrito',
  checkout: '/checkout',
  paymentResult: '/pago/resultado',
  signIn: '/ingresar',
  signUp: '/registro',
  account: '/mi-cuenta',
  orders: '/mis-pedidos',
  accreditationRequest: '/acreditacion/solicitar',
  accreditationStatus: '/acreditacion/estado',
  sellerRoot: '/vendedor',
  sellerProducts: '/vendedor/productos',
  sellerProductCreate: '/vendedor/productos/nuevo',
  sellerProductEdit: '/vendedor/productos/:productId/editar',
  sellerCategories: '/vendedor/categorias',
  sellerReports: '/vendedor/reportes',
  adminRoot: '/admin',
  adminAccreditations: '/admin/acreditaciones',
  adminAccreditationDetail: '/admin/acreditaciones/:requestId',
  adminUsers: '/admin/usuarios',
  adminProducts: '/admin/productos',
  adminOrders: '/admin/pedidos',
  adminReports: '/admin/reportes',
} as const

export const catalogSearchParameter = 'q' as const
export const catalogCategoryParameter = 'categoria' as const

export const paths = {
  ...routePatterns,
  catalogWithFilters: ({
    categoryId,
    query,
  }: {
    categoryId?: string
    query?: string
  } = {}) => {
    const search = new URLSearchParams()
    if (query) search.set(catalogSearchParameter, query)
    if (categoryId) search.set(catalogCategoryParameter, categoryId)
    const queryString = search.toString()
    return `${routePatterns.catalog}${queryString ? `?${queryString}` : ''}`
  },
  productDetail: (productId: string) =>
    `/producto/${encodeURIComponent(productId)}` as const,
  sellerProductEdit: (productId: string) =>
    `/vendedor/productos/${encodeURIComponent(productId)}/editar` as const,
  adminAccreditationDetail: (requestId: string) =>
    `/admin/acreditaciones/${encodeURIComponent(requestId)}` as const,
}
