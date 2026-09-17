import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  adminLogin as apiAdminLogin,
  fetchAdminProfile,
  getAdminAuthToken,
  setAdminAuthToken,
  clearAdminAuthToken,
  getStoredAdminUser,
  setStoredAdminUser,
  clearStoredAdminUser,
  type AdminUser,
} from '../services/adminApi'

export type { AdminUser }

export interface AdminContextType {
  adminUser: AdminUser | null
  isAdminAuthenticated: boolean
  isAdminLoading: boolean
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  adminLogout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous optimistic session initialization for instantaneous renders
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const token = getAdminAuthToken()
    if (!token) return null
    return getStoredAdminUser()
  })

  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(() => {
    return Boolean(getAdminAuthToken())
  })

  // Authoritative server-side session verification on mount
  useEffect(() => {
    let isMounted = true

    const initAdminAuth = async () => {
      const token = getAdminAuthToken()
      if (!token) {
        if (isMounted) {
          setAdminUser(null)
          clearAdminAuthToken()
          clearStoredAdminUser()
          setIsAdminLoading(false)
        }
        return
      }

      try {
        // Authoritative database check via GET /api/auth/me
        const verifiedProfile = await fetchAdminProfile(token)
        if (isMounted) {
          if (verifiedProfile && verifiedProfile.role === 'admin') {
            setAdminUser(verifiedProfile)
            setStoredAdminUser(verifiedProfile)
          } else {
            // Token expired, invalid, or user is not an administrator
            setAdminUser(null)
            clearAdminAuthToken()
            clearStoredAdminUser()
          }
        }
      } catch {
        if (isMounted) {
          setAdminUser(null)
          clearAdminAuthToken()
          clearStoredAdminUser()
        }
      } finally {
        if (isMounted) {
          setIsAdminLoading(false)
        }
      }
    }

    initAdminAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAdminLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsAdminLoading(true)
    try {
      const res = await apiAdminLogin({ email, password })
      if (res && res.success && res.token && res.user && res.user.role === 'admin') {
        setAdminAuthToken(res.token)
        setStoredAdminUser(res.user)
        setAdminUser(res.user)
        setIsAdminLoading(false)
        return { success: true }
      }
      setIsAdminLoading(false)
      return { success: false, error: res?.message || 'Admin login failed.' }
    } catch (err: unknown) {
      setIsAdminLoading(false)
      const errorMsg = err instanceof Error ? err.message : 'Admin login failed.'
      return { success: false, error: errorMsg }
    }
  }

  const handleAdminLogout = () => {
    clearAdminAuthToken()
    clearStoredAdminUser()
    setAdminUser(null)
  }

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        isAdminAuthenticated: Boolean(adminUser && adminUser.role === 'admin'),
        isAdminLoading,
        adminLogin: handleAdminLogin,
        adminLogout: handleAdminLogout,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export default AdminContext
