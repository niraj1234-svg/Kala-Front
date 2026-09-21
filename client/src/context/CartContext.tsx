import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import {
  fetchServerCart,
  addServerCartItem,
  updateServerCartItemQty,
  removeServerCartItem,
  clearServerCart,
} from '../services/cartApi'

export interface CartItem {
  productId: string
  name: string
  image: string
  price: number
  size: string
  quantity: number
}

export interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  cartSubtotal: number
  addToCart: (
    product: { id: string; name: string; image: string; price: number },
    size: string,
    quantity: number
  ) => void
  removeFromCart: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
}

const GUEST_CART_STORAGE_KEY = 'kala_guest_cart'

function getUserCartKey(userId?: string | null): string {
  if (userId && userId.trim()) {
    return `kala_cart_${userId.trim()}`
  }
  return GUEST_CART_STORAGE_KEY
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth()
  const activeUserId = currentUser?.id || null

  // Ref to track user transition across renders
  const previousUserIdRef = useRef<string | null>(activeUserId)
  // Flag to avoid saving empty cart to server right after logout
  const isSyncingServerRef = useRef<boolean>(false)

  // Clean up any legacy, un-namespaced 'kala_cart' key immediately
  useEffect(() => {
    try {
      localStorage.removeItem('kala_cart')
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Initialize cart state from the current user's or guest's namespaced storage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const storageKey = getUserCartKey(activeUserId)
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (err) {
      console.warn('[CartContext] Failed to parse cart from storage:', err)
    }
    return []
  })

  // Synchronize cart state on user change (Login, Logout, Account Switching)
  useEffect(() => {
    const previousUserId = previousUserIdRef.current
    previousUserIdRef.current = activeUserId

    // CASE 1: User Logged Out (was authenticated, now unauthenticated)
    if (previousUserId && !activeUserId) {
      isSyncingServerRef.current = true
      try {
        // Clear previous user's local cache
        localStorage.removeItem(getUserCartKey(previousUserId))
        localStorage.removeItem('kala_cart')
        localStorage.removeItem(GUEST_CART_STORAGE_KEY)
      } catch {}
      setCartItems([])
      setTimeout(() => {
        isSyncingServerRef.current = false
      }, 50)
      return
    }

    // CASE 2: Account Switched (User A -> User B directly)
    if (previousUserId && activeUserId && previousUserId !== activeUserId) {
      isSyncingServerRef.current = true
      try {
        localStorage.removeItem(getUserCartKey(previousUserId))
      } catch {}
    }

    // CASE 3: Authenticated User Logged In / Mounted
    if (activeUserId && isAuthenticated) {
      isSyncingServerRef.current = true

      // Load fast cached version if available
      try {
        const cached = localStorage.getItem(getUserCartKey(activeUserId))
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed)) {
            setCartItems(parsed)
          }
        } else {
          setCartItems([])
        }
      } catch {
        setCartItems([])
      }

      // Authoritatively fetch the server cart from MongoDB
      fetchServerCart()
        .then((res) => {
          if (res && res.success && res.cart && Array.isArray(res.cart.items)) {
            const mappedItems: CartItem[] = res.cart.items.map((it) => ({
              productId: it.productId,
              name: it.name,
              image: it.image,
              price: it.price,
              size: it.size,
              quantity: it.quantity,
            }))
            setCartItems(mappedItems)
            try {
              localStorage.setItem(getUserCartKey(activeUserId), JSON.stringify(mappedItems))
            } catch {}
          }
        })
        .catch((err) => {
          console.warn('[CartContext] Failed to fetch server cart:', err)
        })
        .finally(() => {
          isSyncingServerRef.current = false
        })
      return
    }

    // CASE 4: Unauthenticated / Guest state
    if (!activeUserId) {
      try {
        const stored = localStorage.getItem(GUEST_CART_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            setCartItems(parsed)
            return
          }
        }
      } catch {}
      setCartItems([])
    }
  }, [activeUserId, isAuthenticated])

  // Save current cartItems to namespaced local storage whenever it changes
  useEffect(() => {
    if (isSyncingServerRef.current) return
    try {
      const storageKey = getUserCartKey(activeUserId)
      localStorage.setItem(storageKey, JSON.stringify(cartItems))
    } catch (err) {
      console.error('[CartContext] Failed to save cart to localStorage:', err)
    }
  }, [cartItems, activeUserId])

  // Total quantity of all items in cart
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Subtotal in Rupees
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  const addToCart = (
    product: { id: string; name: string; image: string; price: number },
    size: string,
    quantity: number
  ) => {
    if (!size || quantity <= 0) return

    const clampedQuantity = Math.min(quantity, 10)

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product.id && item.size === size
      )

      if (existingIndex > -1) {
        const updated = [...prevItems]
        const currentQty = updated[existingIndex].quantity
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(currentQty + clampedQuantity, 10),
        }
        return updated
      } else {
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          size,
          quantity: clampedQuantity,
        }
        return [...prevItems, newItem]
      }
    })

    // If authenticated, persist to MongoDB backend
    if (isAuthenticated && activeUserId) {
      addServerCartItem({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        size,
        quantity: clampedQuantity,
      }).catch((err) => {
        console.warn('[CartContext] Failed to sync added item with server:', err)
      })
    }
  }

  const removeFromCart = (productId: string, size: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && item.size === size)
      )
    )

    // If authenticated, persist deletion to MongoDB backend
    if (isAuthenticated && activeUserId) {
      removeServerCartItem(productId, size).catch((err) => {
        console.warn('[CartContext] Failed to sync removed item with server:', err)
      })
    }
  }

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size)
      return
    }

    const clampedQuantity = Math.min(Math.max(1, quantity), 10)

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId && item.size === size) {
          return { ...item, quantity: clampedQuantity }
        }
        return item
      })
    )

    // If authenticated, persist quantity change to MongoDB backend
    if (isAuthenticated && activeUserId) {
      updateServerCartItemQty(productId, size, clampedQuantity).catch((err) => {
        console.warn('[CartContext] Failed to sync quantity with server:', err)
      })
    }
  }

  const clearCart = () => {
    setCartItems([])
    try {
      localStorage.removeItem(getUserCartKey(activeUserId))
      localStorage.removeItem('kala_cart')
    } catch {}

    // If authenticated, clear in MongoDB backend
    if (isAuthenticated && activeUserId) {
      clearServerCart().catch((err) => {
        console.warn('[CartContext] Failed to clear server cart:', err)
      })
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
