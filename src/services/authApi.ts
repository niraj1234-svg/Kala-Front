const API_BASE_URL = 'http://localhost:5000/api'
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
 * Registers a new customer account
 */
export async function registerUser(
  payload: RegisterRequest
): Promise<AuthResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
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

    const data = await response.json()

    if (!response.ok || !data.success) {
      const errorMessage =
        data?.message || 'Unable to complete registration. Please try again.'
      throw new Error(errorMessage)
    }

    if (data.token) {
      setAuthToken(data.token)
    }

    return data
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    throw new Error(
      err.message || 'Unable to complete registration. Please try again.'
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

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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

    const data = await response.json()

    if (!response.ok || !data.success) {
      const errorMessage =
        data?.message || 'Invalid email or password.'
      throw new Error(errorMessage)
    }

    if (data.token) {
      setAuthToken(data.token)
    }

    return data
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    throw new Error(
      err.message || 'Unable to log in right now. Please try again.'
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
