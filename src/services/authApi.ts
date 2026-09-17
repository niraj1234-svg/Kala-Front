import { API_BASE_URL } from '../config/api'
const AUTH_TOKEN_KEY = 'kala_auth_token'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  token: string
  user: User
}

export interface GetMeResponse {
  success: boolean
  user: User
}

/**
 * Retrieves stored JWT token from localStorage
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch (err) {
    console.error('Failed to retrieve auth token from storage:', err)
    return null
  }
}

/**
 * Stores JWT token in localStorage
 */
export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } catch (err) {
    console.error('Failed to store auth token:', err)
  }
}

/**
 * Removes JWT token from localStorage
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  } catch (err) {
    console.error('Failed to remove auth token from storage:', err)
  }
}

/**
 * Normalizes technical network/fetch exceptions into user-friendly messages
 * without exposing internal server stack traces or raw 'Failed to fetch'.
 */
function formatAuthErrorMessage(err: any, fallbackMessage: string): string {
  if (err?.name === 'AbortError') {
    return 'Request timed out. Please check your connection and try again.'
  }
  const msg = err?.message || ''
  if (
    msg === 'Failed to fetch' ||
    msg === 'fetch failed' ||
    msg.toLowerCase().includes('failed to fetch') ||
    msg.toLowerCase().includes('networkerror') ||
    err?.name === 'TypeError'
  ) {
    return 'Unable to connect to KALA right now. Please make sure the server is running and try again.'
  }
  return msg || fallbackMessage
}

/**
 * Registers a new customer account
 */
export async function registerUser(
  payload: RegisterRequest
): Promise<AuthResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)
  const endpoint = `${API_BASE_URL}/auth/register`

  console.log(`[AuthApi] Register request -> URL: ${endpoint}`)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    console.log(`[AuthApi] Register response status: ${response.status}`)

    const data = await response.json()

    if (!response.ok || !data.success) {
      const errorMessage =
        data?.message || 'Unable to complete registration. Please try again.'
      console.warn(`[AuthApi] Register response not ok: ${response.status} - ${errorMessage}`)
      throw new Error(errorMessage)
    }

    if (data.token) {
      setAuthToken(data.token)
    }

    return data
  } catch (err: any) {
    clearTimeout(timeoutId)
    console.error(`[AuthApi] Register fetch failure -> URL: ${endpoint}, error:`, {
      name: err?.name,
      message: err?.message,
    })
    throw new Error(
      formatAuthErrorMessage(err, 'Unable to complete registration. Please try again.')
    )
  }
}

/**
 * Authenticates an existing customer
 */
export async function loginUser(
  payload: LoginRequest
): Promise<AuthResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)
  const endpoint = `${API_BASE_URL}/auth/login`

  console.log(`[AuthApi] Login request -> URL: ${endpoint}`)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    console.log(`[AuthApi] Login response status: ${response.status}`)

    const data = await response.json()

    if (!response.ok || !data.success) {
      const errorMessage =
        data?.message || 'Invalid email or password.'
      console.warn(`[AuthApi] Login response not ok: ${response.status} - ${errorMessage}`)
      throw new Error(errorMessage)
    }

    if (data.token) {
      setAuthToken(data.token)
    }

    return data
  } catch (err: any) {
    clearTimeout(timeoutId)
    console.error(`[AuthApi] Login fetch failure -> URL: ${endpoint}, error:`, {
      name: err?.name,
      message: err?.message,
    })
    throw new Error(
      formatAuthErrorMessage(err, 'Unable to log in right now. Please try again.')
    )
  }
}

/**
 * Fetches current authenticated user using stored JWT token
 */
export async function fetchCurrentUser(): Promise<User | null> {
  const token = getAuthToken()
  if (!token) {
    return null
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (response.status === 401) {
      clearAuthToken()
      return null
    }

    const data: GetMeResponse = await response.json()

    if (!response.ok || !data.success || !data.user) {
      throw new Error('Failed to retrieve user profile.')
    }

    return data.user
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      console.warn('[authApi] fetchCurrentUser timed out.')
      return null
    }
    console.warn('[authApi] Could not fetch current user:', err.message)
    return null
  }
}
