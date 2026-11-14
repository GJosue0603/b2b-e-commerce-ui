interface StoredAccessToken {
  readonly expiresAt: number
  readonly token: string
}

let storedAccessToken: StoredAccessToken | null = null
export const API_SESSION_STORAGE_KEY = 'nexotech.api-session'

function persistAccessToken(): void {
  try {
    if (storedAccessToken) {
      sessionStorage.setItem(API_SESSION_STORAGE_KEY, JSON.stringify(storedAccessToken))
    } else {
      sessionStorage.removeItem(API_SESSION_STORAGE_KEY)
    }
  } catch {
    // Browsers may disable storage; the current in-memory session still works.
  }
}

export function setApiAccessToken(token: string, expiresAt: number): void {
  storedAccessToken = { expiresAt, token }
  persistAccessToken()
}

export function getApiAccessToken(): string | null {
  if (!storedAccessToken) {
    try {
      const raw = sessionStorage.getItem(API_SESSION_STORAGE_KEY)
      if (raw) {
        const saved: unknown = JSON.parse(raw)
        if (
          typeof saved === 'object' && saved !== null &&
          'token' in saved && typeof saved.token === 'string' &&
          'expiresAt' in saved && typeof saved.expiresAt === 'number' &&
          Number.isFinite(saved.expiresAt)
        ) {
          storedAccessToken = { token: saved.token, expiresAt: saved.expiresAt }
        }
      }
    } catch {
      // Missing, invalid or inaccessible storage is treated as a signed-out session.
    }
  }
  if (!storedAccessToken || Date.now() >= storedAccessToken.expiresAt) {
    clearApiAccessToken()
    return null
  }

  return storedAccessToken.token
}

export function clearApiAccessToken(): void {
  storedAccessToken = null
  persistAccessToken()
}
