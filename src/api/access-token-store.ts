interface StoredAccessToken {
  readonly expiresAt: number
  readonly token: string
}

let storedAccessToken: StoredAccessToken | null = null

export function setApiAccessToken(token: string, expiresAt: number): void {
  storedAccessToken = { expiresAt, token }
}

export function getApiAccessToken(): string | null {
  if (!storedAccessToken || Date.now() >= storedAccessToken.expiresAt) {
    storedAccessToken = null
    return null
  }

  return storedAccessToken.token
}

export function clearApiAccessToken(): void {
  storedAccessToken = null
}
