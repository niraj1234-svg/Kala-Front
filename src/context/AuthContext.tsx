import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  registerUser,
  loginUser,
  fetchCurrentUser,
  getAuthToken,
  clearAuthToken,
  type User,
  type RegisterRequest,
} from '../services/authApi'

export type { User }

export interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const CURRENT_USER_KEY = 'kala_current_user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous session initialization to support immediate component pre-fill (e.g. Checkout)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const token = getAuthToken()
    if (!token) return null
    try {
      const cached = localStorage.getItem(CURRENT_USER_KEY)
      if (cached) {
        return JSON.parse(cached) as User
      }
    } catch {
      // Ignore cache parse error
    }
    return null
  })

  const [isLoading, setIsLoading] = useState<boolean>(() => !currentUser && Boolean(getAuthToken()))

  // Session hydration and verification on mount
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      const token = getAuthToken()
      if (!token) {
        if (isMounted) {
          setCurrentUser(null)
          localStorage.removeItem(CURRENT_USER_KEY)
          setIsLoading(false)
        }
        return
      }

      try {
        const user = await fetchCurrentUser()
        if (isMounted) {
          if (user) {
            setCurrentUser(user)
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
          } else {
            setCurrentUser(null)
            localStorage.removeItem(CURRENT_USER_KEY)
          }
        }
      } catch (err) {
        if (isMounted) {
          setCurrentUser(null)
          localStorage.removeItem(CURRENT_USER_KEY)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const register = async (
    userData: RegisterRequest
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await registerUser(userData)
      if (res && res.success && res.user) {
        setCurrentUser(res.user)
        try {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user))
        } catch {}
        return { success: true }
      }
      return { success: false, error: res?.message || 'Registration failed.' }
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' }
    }
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await loginUser({ email, password })
      if (res && res.success && res.user) {
        setCurrentUser(res.user)
        try {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user))
        } catch {}
        return { success: true }
      }
      return { success: false, error: res?.message || 'Invalid email or password.' }
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid email or password.' }
    }
  }

  const logout = () => {
    clearAuthToken()
    try {
      localStorage.removeItem(CURRENT_USER_KEY)
    } catch {}
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
