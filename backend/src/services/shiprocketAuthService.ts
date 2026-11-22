import {
  getShiprocketCredentials,
  isShiprocketConfigured,
  getMaskedShiprocketEmail,
  SHIPROCKET_API_BASE_URL,
} from '../config/shiprocketConfig'

export interface ShiprocketCachedToken {
  token: string
  expiresAt: number // epoch ms
  issuedAt: number  // epoch ms
  email: string
}

export interface ShiprocketAuthOptions {
  timeoutMs?: number
  baseUrl?: string
  customFetch?: typeof fetch
  forceRefresh?: boolean
}

// 10 seconds default timeout for Shiprocket authentication calls
export const SHIPROCKET_AUTH_TIMEOUT_MS = 10_000

// Default proactive refresh buffer: refresh if token expires in less than 15 minutes
export const DEFAULT_REFRESH_BUFFER_MS = 15 * 60 * 1000

// In-memory token cache and single-flight in-progress promise
let cachedToken: ShiprocketCachedToken | null = null
let inFlightAuthPromise: Promise<string> | null = null

/**
 * Decodes the JWT payload safely to extract the standard `exp` (seconds since epoch) claim.
 * Returns the expiration epoch timestamp in milliseconds, or null if unparseable.
 */
export function parseJwtExpiryMs(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null

    // Base64Url decode payload (second segment)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const jsonStr = Buffer.from(padded, 'base64').toString('utf8')
    const payload = JSON.parse(jsonStr)

    if (typeof payload.exp === 'number' && payload.exp > 0) {
      return payload.exp * 1000
    }
  } catch {
    // If token is not standard JWT or payload is not JSON, ignore and fallback
  }
  return null
}

/**
 * Calculates the expiration timestamp in epoch milliseconds using:
 * 1. The token's own cryptographically signed JWT `exp` claim, if present.
 * 2. The explicit `expires_in` (seconds) field in the response JSON, if present.
 * 3. The explicit `expires_at` field in the response JSON, if present.
 * 4. A conservative 24-hour default fallback if neither is available.
 */
export function calculateTokenExpiryMs(responseBody: any, token: string): number {
  // 1. Highest priority: actual signed JWT exp claim from token
  const jwtExpMs = parseJwtExpiryMs(token)
  if (jwtExpMs !== null && jwtExpMs > Date.now()) {
    return jwtExpMs
  }

  // 2. Response expires_in (seconds)
  if (typeof responseBody?.expires_in === 'number' && responseBody.expires_in > 0) {
    return Date.now() + responseBody.expires_in * 1000
  }

  // 3. Response expires_at (ISO date string or timestamp)
  if (responseBody?.expires_at) {
    const parsed = new Date(responseBody.expires_at).getTime()
    if (!isNaN(parsed) && parsed > Date.now()) {
      return parsed
    }
  }

  // 4. Safe conservative default: 24 hours from now
  return Date.now() + 24 * 60 * 60 * 1000
}

/**
 * Determines whether a cached token is valid and outside the proactive refresh window.
 */
export function isTokenValid(cached: ShiprocketCachedToken | null, bufferMs = DEFAULT_REFRESH_BUFFER_MS): boolean {
  if (!cached || !cached.token) return false
  const now = Date.now()
  const totalLifetime = cached.expiresAt - cached.issuedAt
  // If total lifetime is shorter than twice the buffer, use 20% of lifetime as buffer
  const effectiveBuffer = totalLifetime > 0 && totalLifetime < bufferMs * 2
    ? Math.floor(totalLifetime * 0.2)
    : bufferMs

  return now < (cached.expiresAt - effectiveBuffer)
}

/**
 * Internal worker performing the HTTP POST /auth/login request.
 * Never logs credentials or raw tokens.
 */
async function performShiprocketLogin(options?: ShiprocketAuthOptions): Promise<string> {
  const { email, password } = getShiprocketCredentials()

  if (!email || !password) {
    throw new Error(
      'Shiprocket credentials are not configured. Please ensure SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD are set.'
    )
  }

  const timeoutMs = options?.timeoutMs ?? SHIPROCKET_AUTH_TIMEOUT_MS
  const baseUrl = (options?.baseUrl || SHIPROCKET_API_BASE_URL).replace(/\/+$/, '')
  const fetchFn = options?.customFetch || fetch

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const loginUrl = `${baseUrl}/auth/login`
    const response = await fetchFn(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Shiprocket authentication failed: Invalid credentials or unauthorized access (HTTP ${response.status}).`
        )
      }
      if (response.status === 429) {
        throw new Error('Shiprocket authentication failed: Rate limit exceeded (HTTP 429). Please retry later.')
      }
      if (response.status >= 500) {
        throw new Error(`Shiprocket authentication service unavailable (HTTP ${response.status}).`)
      }
      throw new Error(`Shiprocket authentication failed with status ${response.status}.`)
    }

    let responseData: any
    try {
      responseData = await response.json()
    } catch {
      throw new Error('Malformed response from Shiprocket: Expected JSON body from authentication endpoint.')
    }

    const token = responseData?.token
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new Error('Malformed response from Shiprocket: Missing or empty authentication token in response body.')
    }

    const cleanToken = token.trim()
    const now = Date.now()
    const expiresAt = calculateTokenExpiryMs(responseData, cleanToken)

    cachedToken = {
      token: cleanToken,
      expiresAt,
      issuedAt: now,
      email,
    }

    return cleanToken
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error(`Shiprocket authentication request timed out (${Math.round(timeoutMs / 1000)}s).`)
    }
    // Re-throw sanitized error without revealing any credential details
    throw error instanceof Error ? error : new Error(String(error))
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Retrieves a valid Shiprocket authentication Bearer token.
 * 
 * Guarantees:
 * 1. In-memory caching: Reuses cached token as long as it has not passed the proactive refresh buffer.
 * 2. Single-flight execution: If multiple callers request a token concurrently, only one HTTP login call is made.
 * 3. Expiry intelligence: Inspects token's JWT `exp` or response `expires_in` to determine true validity.
 * 4. Safety: Never exposes passwords or tokens in errors or logs.
 */
export async function getShiprocketToken(options?: ShiprocketAuthOptions): Promise<string> {
  if (!isShiprocketConfigured()) {
    throw new Error(
      'Shiprocket credentials are not configured. Please ensure SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD are set in the environment.'
    )
  }

  // 1. Check if existing cached token is valid and outside refresh buffer
  if (!options?.forceRefresh && isTokenValid(cachedToken)) {
    return cachedToken!.token
  }

  // 2. Single-flight: If an authentication request is already in-flight, await the shared promise
  if (inFlightAuthPromise) {
    return inFlightAuthPromise
  }

  // 3. Launch single-flight authentication promise
  inFlightAuthPromise = performShiprocketLogin(options).finally(() => {
    inFlightAuthPromise = null
  })

  return inFlightAuthPromise
}

/**
 * Invalidates the currently cached token (e.g. when an API call encounters an unexpected 401).
 * Forces the next call to re-authenticate with Shiprocket.
 */
export function invalidateToken(): void {
  cachedToken = null
}

/**
 * Safely inspects current cached token metadata without exposing the raw token.
 */
export function getCachedTokenInfo(): {
  hasToken: boolean
  isExpired: boolean
  expiresAt: string | null
  remainingSeconds: number | null
  maskedEmail: string | null
} {
  if (!cachedToken) {
    return {
      hasToken: false,
      isExpired: true,
      expiresAt: null,
      remainingSeconds: null,
      maskedEmail: null,
    }
  }

  const now = Date.now()
  const isExpired = now >= cachedToken.expiresAt
  const remainingSeconds = Math.max(0, Math.floor((cachedToken.expiresAt - now) / 1000))

  return {
    hasToken: true,
    isExpired,
    expiresAt: new Date(cachedToken.expiresAt).toISOString(),
    remainingSeconds,
    maskedEmail: getMaskedShiprocketEmail(cachedToken.email),
  }
}

/**
 * Test helper to reset internal cache and in-flight promises.
 */
export function resetShiprocketAuthForTesting(): void {
  cachedToken = null
  inFlightAuthPromise = null
}
