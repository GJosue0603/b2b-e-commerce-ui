import type {
  AcreditacionPyme,
  Carrito,
  Categoria,
  EntityId,
  InventarioProducto,
  Pago,
  Pedido,
  Producto,
  ReporteVentas,
  SolicitudPyme,
  Usuario,
} from '../../domain'
import type { RepositoryRequestOptions } from './common'

export interface BuyerProfileInput {
  readonly apellidos: string
  readonly correo: string
  readonly nombre: string
  readonly telefono: string
}

export interface ProductInput {
  readonly activo: boolean
  readonly categoriaId: EntityId
  readonly descripcion: string
  readonly existencias: number
  readonly imagenUrl: string
  readonly nombre: string
  readonly precioPyme: number
  readonly precioRegular: number
}

export interface CategoryInput {
  readonly activo: boolean
  readonly descripcion: string
  readonly nombre: string
}

export interface UserRepository {
  createBuyer(
    input: BuyerProfileInput,
    options?: RepositoryRequestOptions,
  ): Promise<Usuario>
  getByEmail(
    email: string,
    options?: RepositoryRequestOptions,
  ): Promise<Usuario | null>
  getById(
    id: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<Usuario | null>
  list(options?: RepositoryRequestOptions): Promise<readonly Usuario[]>
  updateProfile(
    id: EntityId,
    input: BuyerProfileInput,
    options?: RepositoryRequestOptions,
  ): Promise<Usuario>
}

export interface CatalogRepository {
  createCategory(
    input: CategoryInput,
    options?: RepositoryRequestOptions,
  ): Promise<Categoria>
  createProduct(
    input: ProductInput,
    options?: RepositoryRequestOptions,
  ): Promise<Producto>
  getProductById(
    id: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<Producto | null>
  listCategories(
    options?: RepositoryRequestOptions,
  ): Promise<readonly Categoria[]>
  listManagedCategories(
    options?: RepositoryRequestOptions,
  ): Promise<readonly Categoria[]>
  listManagedProducts(
    options?: RepositoryRequestOptions,
  ): Promise<readonly Producto[]>
  listInventory(
    options?: RepositoryRequestOptions,
  ): Promise<readonly InventarioProducto[]>
  listProducts(options?: RepositoryRequestOptions): Promise<readonly Producto[]>
  setCategoryActive(
    id: EntityId,
    active: boolean,
    options?: RepositoryRequestOptions,
  ): Promise<Categoria>
  setProductActive(
    id: EntityId,
    active: boolean,
    options?: RepositoryRequestOptions,
  ): Promise<Producto>
  updateCategory(
    id: EntityId,
    input: CategoryInput,
    options?: RepositoryRequestOptions,
  ): Promise<Categoria>
  updateProduct(
    id: EntityId,
    input: ProductInput,
    options?: RepositoryRequestOptions,
  ): Promise<Producto>
}

export interface CommerceRepository {
  getCartByUser(
    userId: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<Carrito | null>
  listOrdersByUser(
    userId: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<readonly Pedido[]>
  listPaymentsByUser(
    userId: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<readonly Pago[]>
}

export interface PymeRepository {
  getAccreditationsByUser(
    userId: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<readonly AcreditacionPyme[]>
  getAccreditationByUser(
    userId: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<AcreditacionPyme | null>
  getRequestByUser(
    userId: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<SolicitudPyme | null>
  listRequestsByUser(
    userId: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<readonly SolicitudPyme[]>
  listRequests(
    options?: RepositoryRequestOptions,
  ): Promise<readonly SolicitudPyme[]>
  submitRequest(
    input: SubmitPymeRequestInput,
    options?: RepositoryRequestOptions,
  ): Promise<SolicitudPyme>
}

export interface SubmitPymeRequestInput {
  readonly actividadEconomica: string
  readonly documentos: readonly string[]
  readonly identificacionNegocio: string
  readonly nombreComercial: string
  readonly usuarioId: EntityId
}

export interface ReportRepository {
  list(options?: RepositoryRequestOptions): Promise<readonly ReporteVentas[]>
}
