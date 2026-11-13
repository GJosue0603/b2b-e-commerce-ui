import type { EntityId, ItemPedido, MontoColones, Pedido } from '../../domain'
import type { RepositoryRequestOptions } from '../interfaces/common'

export interface CommitApprovedOrderInput {
  readonly discount: MontoColones
  readonly items: readonly ItemPedido[]
  readonly orderId: EntityId
  readonly paymentId: EntityId
  readonly regularSubtotal: MontoColones
  readonly total: MontoColones
  readonly userId: EntityId
}

export interface OrderRepository {
  commitApprovedOrder(
    input: CommitApprovedOrderInput,
    options?: RepositoryRequestOptions,
  ): Promise<Pedido>
  findByPaymentId(
    paymentId: EntityId,
    options?: RepositoryRequestOptions,
  ): Promise<Pedido | null>
}
