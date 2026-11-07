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
  getProductById(
    id: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<Producto | null>
  listCategories(
    options?: RepositoryRequestOptions,
  ): Promise<readonly Categoria[]>
  listInventory(
    options?: RepositoryRequestOptions,
  ): Promise<readonly InventarioProducto[]>
  listProducts(options?: RepositoryRequestOptions): Promise<readonly Producto[]>
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
