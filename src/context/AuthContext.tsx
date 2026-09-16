import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
}

export interface StoredUser extends User {
  password: string
}

export interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  register: (userData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
  }) => { success: boolean; error?: string }
  logout: () => void
}

const USERS_STORAGE_KEY = 'kala_users'
const CURRENT_USER_STORAGE_KEY = 'kala_current_user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredUsers(): StoredUser[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed to read users from localStorage:', err)
  }
  return []
}

function saveUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (err) {
    console.error('Failed to write users to localStorage:', err)
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const data = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
      if (data) {
        return JSON.parse(data) as User
      }
    } catch (err) {
      console.error('Failed to restore session from localStorage:', err)
    }
    return null
  })

  // Synchronize session to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser))
      } else {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
      }
    } catch (err) {
      console.error('Failed to synchronize session to localStorage:', err)
    }
  }, [currentUser])

  const register = (userData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
  }): { success: boolean; error?: string } => {
    const cleanEmail = userData.email.trim().toLowerCase()
    const users = getStoredUsers()

    // 1. Check duplicate email (case-insensitive)
    const exists = users.some((u) => u.email.toLowerCase() === cleanEmail)
    if (exists) {
      return { success: false, error: 'An account with this email already exists.' }
    }

    // 2. Generate unique user ID
    const userId = `KALA-USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const newStoredUser: StoredUser = {
      id: userId,
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: cleanEmail,
      phone: userData.phone.trim(),
      password: userData.password,
      createdAt: new Date().toISOString(),
    }

    // Save user to kala_users without overwriting previous users
    saveUsers([...users, newStoredUser])

    // Create session for the newly registered user (without exposing password in session)
    const userSession: User = {
      id: newStoredUser.id,
      firstName: newStoredUser.firstName,
      lastName: newStoredUser.lastName,
      email: newStoredUser.email,
      phone: newStoredUser.phone,
      createdAt: newStoredUser.createdAt,
    }

    setCurrentUser(userSession)
    return { success: true }
  }

  const login = (
    email: string,
    password: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase()
    const users = getStoredUsers()

    const foundUser = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    )

    if (!foundUser) {
      return { success: false, error: 'Invalid email or password.' }
    }

    const userSession: User = {
      id: foundUser.id,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      email: foundUser.email,
      phone: foundUser.phone,
      createdAt: foundUser.createdAt,
    }

    setCurrentUser(userSession)
    return { success: true }
  }

  const logout = () => {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
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
