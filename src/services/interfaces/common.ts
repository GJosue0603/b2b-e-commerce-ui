export interface RepositoryRequestOptions {
  readonly signal?: AbortSignal
}

export type AsyncState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: Error }

export type RepositoryErrorCode = 'aborted' | 'mock_failure' | 'not_found'

export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly code: RepositoryErrorCode,
  ) {
    super(message)
    this.name = 'RepositoryError'
  }
}
