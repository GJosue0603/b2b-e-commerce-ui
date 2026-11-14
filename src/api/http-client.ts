export interface ApiClientConfig {
  readonly baseUrl?: string
  readonly fetcher?: typeof fetch
  readonly getAccessToken?: () => string | null
}

export interface ApiRequestOptions {
  readonly headers?: HeadersInit
  readonly signal?: AbortSignal
}

export type ApiHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export class ApiClientError extends Error {
  readonly cause: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = new.target.name
    this.cause = cause
  }
}

export class ApiHttpError extends ApiClientError {
  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly body: unknown,
  ) {
    super(
      typeof body === 'string' && body.trim()
        ? body
        : statusText || `HTTP ${status}`,
    )
  }
}

export class ApiNetworkError extends ApiClientError {
  constructor(message: string, cause?: unknown) {
    super(message, cause)
  }
}

export class ApiResponseError extends ApiClientError {
  constructor(message: string, cause?: unknown) {
    super(message, cause)
  }
}

export class ApiAbortError extends ApiClientError {
  constructor(cause?: unknown) {
    super('La solicitud fue cancelada.', cause)
  }
}

function isAbortError(reason: unknown): boolean {
  return (
    typeof reason === 'object' &&
    reason !== null &&
    'name' in reason &&
    reason.name === 'AbortError'
  )
}

function hasJsonContentType(contentType: string | null): boolean {
  return Boolean(contentType && /(?:application\/json|\+json)/i.test(contentType))
}

async function readResponseBody(response: Response): Promise<unknown> {
  let text: string

  try {
    text = await response.text()
  } catch (reason) {
    if (isAbortError(reason)) throw new ApiAbortError(reason)
    throw new ApiNetworkError('No fue posible leer la respuesta de la API.', reason)
  }

  if (!text) return undefined
  if (!hasJsonContentType(response.headers.get('content-type'))) return text

  try {
    return JSON.parse(text) as unknown
  } catch (reason) {
    if (!response.ok) return text
    throw new ApiResponseError('La API devolvió una respuesta JSON inválida.', reason)
  }
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly fetcher: typeof fetch
  private readonly getAccessToken?: () => string | null

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = (config.baseUrl || '/v1').replace(/\/+$/, '')
    this.fetcher = config.fetcher ?? ((input, init) => globalThis.fetch(input, init))
    this.getAccessToken = config.getAccessToken
  }

  get<TResponse>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<TResponse | undefined> {
    return this.request<TResponse>('GET', path, options)
  }

  post<TResponse, TBody>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Promise<TResponse | undefined> {
    return this.request<TResponse>('POST', path, { ...options, body })
  }

  put<TResponse, TBody>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Promise<TResponse | undefined> {
    return this.request<TResponse>('PUT', path, { ...options, body })
  }

  patch<TResponse, TBody>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Promise<TResponse | undefined> {
    return this.request<TResponse>('PATCH', path, { ...options, body })
  }

  delete<TResponse, TBody = unknown>(
    path: string,
    options: ApiRequestOptions & { readonly body?: TBody } = {},
  ): Promise<TResponse | undefined> {
    return this.request<TResponse>('DELETE', path, options)
  }

  async request<TResponse>(
    method: ApiHttpMethod,
    path: string,
    options: ApiRequestOptions & { readonly body?: unknown } = {},
  ): Promise<TResponse | undefined> {
    const headers = new Headers({ Accept: 'application/json' })
    const token = this.getAccessToken?.()

    if (token) headers.set('Authorization', `Bearer ${token}`)
    new Headers(options.headers).forEach((value, key) => headers.set(key, value))

    const hasBody = options.body !== undefined
    if (hasBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    let response: Response
    try {
      response = await this.fetcher(this.buildUrl(path), {
        method,
        headers,
        signal: options.signal,
        ...(hasBody ? { body: JSON.stringify(options.body) } : {}),
      })
    } catch (reason) {
      if (options.signal?.aborted || isAbortError(reason)) {
        throw new ApiAbortError(reason)
      }
      throw new ApiNetworkError('No fue posible conectar con la API.', reason)
    }

    if (response.status === 204) {
      if (!response.ok) {
        throw new ApiHttpError(response.status, response.statusText, undefined)
      }
      return undefined
    }

    const body = await readResponseBody(response)
    if (!response.ok) {
      throw new ApiHttpError(response.status, response.statusText, body)
    }

    return body as TResponse | undefined
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`
  }
}

export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/v1',
})
