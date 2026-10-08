import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import {
  fetchServerCart,
  addServerCartItem,
  updateServerCartItemQty,
  removeServerCartItem,
  clearServerCart,
  syncServerCart,
  type ServerCartItem,
} from '../services/cartApi'

export interface CartItemCustomization {
  frontText?: string
  backText?: string
  frontPosition?: { x: number; y: number }
  backPosition?: { x: number; y: number }
  frontFontSize?: number
  backFontSize?: number
  frontRotation?: number
  backRotation?: number
  customText?: {
    front?: { text: string; x: number; y: number; fontSize: number; rotation?: number }
    back?: { text: string; x: number; y: number; fontSize: number; rotation?: number }
  }
  price?: number
  apparelType?: string
  color?: string
  position?: 'front' | 'back' | 'left' | 'right' | string
  artworkUrl?: string
  previewUrl?: string
  frontPreviewUrl?: string
  backPreviewUrl?: string
  frontArtworkUrl?: string
  backArtworkUrl?: string
  requirementDetails?: string
  artwork?: {
    x?: number
    y?: number
    width?: number
    height?: number
    rotation?: number
    scale?: number
  }
  frontArtwork?: {
    x?: number
    y?: number
    scale?: number
    fileName?: string
  }
  backArtwork?: {
    x?: number
    y?: number
    scale?: number
    fileName?: string
  }
}

export interface CartItem {
  productId: string
  name: string
  image: string
  price: number
  size: string
  color?: string
  quantity: number
  customization?: CartItemCustomization
}

export interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  cartSubtotal: number
  isCartLoading: boolean
  mergeGuestCart: (targetUserId?: string) => Promise<boolean>
  addToCart: (
    product: { id: string; name: string; image: string; price: number; color?: string },
    size: string,
    quantity: number,
    customization?: CartItemCustomization
  ) => void
  addMultipleToCart: (
    items: Array<{
      product: { id: string; name: string; image: string; price: number; color?: string }
      size: string
      quantity: number
      customization?: CartItemCustomization
    }>
  ) => void
  removeFromCart: (productId: string, size: string, image?: string, backText?: string) => void
  updateQuantity: (productId: string, size: string, quantity: number, image?: string, backText?: string) => void
  clearCart: () => void
}

const GUEST_CART_STORAGE_KEY = 'kala_guest_cart'

export function getUserCartKey(userId?: string | null): string {
  if (userId && userId.trim()) {
    return `kala_cart_${userId.trim()}`
  }
  return GUEST_CART_STORAGE_KEY
}

/**
 * Checks whether two cart items represent the identical product, size, and customization.
 * If identical, their quantities can safely be combined.
 * If size or any customization property differs, they remain separate distinct line items.
 */
export function areCartItemsEqual(a: CartItem, b: CartItem): boolean {
  if (a.productId !== b.productId) return false
  if (a.size.trim().toUpperCase() !== b.size.trim().toUpperCase()) return false
  if ((a.color || '').trim().toLowerCase() !== (b.color || '').trim().toLowerCase()) return false

  const aCustom = a.customization
  const bCustom = b.customization

  if (!aCustom && !bCustom) return true
  if (!aCustom || !bCustom) return false

  if ((aCustom.frontText || '').trim() !== (bCustom.frontText || '').trim()) return false
  if ((aCustom.backText || '').trim() !== (bCustom.backText || '').trim()) return false
  if ((aCustom.artworkUrl || '') !== (bCustom.artworkUrl || '')) return false
  if ((aCustom.previewUrl || '') !== (bCustom.previewUrl || '')) return false
  if ((aCustom.position || '') !== (bCustom.position || '')) return false
  if ((aCustom.apparelType || '') !== (bCustom.apparelType || '')) return false
  if ((aCustom.requirementDetails || '').trim() !== (bCustom.requirementDetails || '').trim()) return false
  if ((aCustom.frontArtwork?.fileName || '') !== (bCustom.frontArtwork?.fileName || '')) return false
  if ((aCustom.backArtwork?.fileName || '') !== (bCustom.backArtwork?.fileName || '')) return false

  if (aCustom.artwork || bCustom.artwork) {
    if (!aCustom.artwork || !bCustom.artwork) return false
    if (aCustom.artwork.x !== bCustom.artwork.x) return false
    if (aCustom.artwork.y !== bCustom.artwork.y) return false
    if (aCustom.artwork.rotation !== bCustom.artwork.rotation) return false
    if (aCustom.artwork.scale !== bCustom.artwork.scale) return false
  }

  return true
}

/**
 * Safely merges incoming items (e.g. from guest cart) into base items (e.g. from account cart).
 * If product + size + customization match, quantities are merged.
 * Otherwise, items are appended as separate rows.
 */
export function mergeCartItems(baseItems: CartItem[], incomingItems: CartItem[]): CartItem[] {
  const result: CartItem[] = baseItems.map((item) => ({
    ...item,
    customization: item.customization ? { ...item.customization } : undefined,
  }))

  for (const incoming of incomingItems) {
    const existingIndex = result.findIndex((existing) => areCartItemsEqual(existing, incoming))
    if (existingIndex > -1) {
      result[existingIndex] = {
        ...result[existingIndex],
        quantity: Math.min(1000000, result[existingIndex].quantity + incoming.quantity),
      }
    } else {
      result.push({
        ...incoming,
        customization: incoming.customization ? { ...incoming.customization } : undefined,
      })
    }
  }

  return result
}

function mapServerToCartItems(items: ServerCartItem[]): CartItem[] {
  return items.map((it) => ({
    productId: it.productId,
    name: it.name,
    image: it.image,
    price: it.price,
    size: it.size,
    color: it.customization?.color || undefined,
    quantity: it.quantity,
    ...(it.customization ? { customization: it.customization as CartItemCustomization } : {}),
  }))
}

function mapCartToServerItems(items: CartItem[]): ServerCartItem[] {
  return items.map((it) => ({
    productId: it.productId,
    name: it.name,
    image: it.image,
    price: it.price,
    size: it.size,
    quantity: it.quantity,
    ...(it.customization ? { customization: it.customization } : {}),
  }))
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const activeUserId = currentUser?.id || null

  const previousUserIdRef = useRef<string | null>(activeUserId)
  const isSyncingServerRef = useRef<boolean>(false)
  const mergeLockRef = useRef<Promise<boolean> | null>(null)

  const [isCartLoading, setIsCartLoading] = useState<boolean>(() => {
    // If active user is present, cart will be loaded/synchronized
    if (activeUserId) return true
    return false
  })

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

  /**
   * Deterministically restores the temporary guest cart, merges it with the authenticated
   * user's server cart, persists the merged result to MongoDB via PUT /api/cart,
   * updates the local cache, and ONLY then clears the temporary guest cart.
   * Completely idempotent: simultaneous calls return the existing pending promise.
   */
  const mergeGuestCart = async (targetUserId?: string): Promise<boolean> => {
    const userId = targetUserId || activeUserId
    if (!userId) return false

    if (mergeLockRef.current) {
      return mergeLockRef.current
    }

    const task = (async (): Promise<boolean> => {
      setIsCartLoading(true)
      isSyncingServerRef.current = true

      try {
        // 1. Read guest cart from localStorage
        let guestItems: CartItem[] = []
        try {
          const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed) && parsed.length > 0) {
              guestItems = parsed
            }
          }
        } catch (e) {
          console.warn('[CartContext] Failed to parse guest cart:', e)
        }

        // 2. Fetch authenticated customer's server cart
        let serverItems: CartItem[] = []
        try {
          const res = await fetchServerCart()
          if (res && res.success && res.cart && Array.isArray(res.cart.items)) {
            serverItems = mapServerToCartItems(res.cart.items)
          }
        } catch (fetchErr) {
          console.warn('[CartContext] fetchServerCart in merge warning:', fetchErr)
        }

        // If there are no guest items to merge, simply load the server cart
        if (guestItems.length === 0) {
          setCartItems(serverItems)
          try {
            localStorage.setItem(getUserCartKey(userId), JSON.stringify(serverItems))
          } catch {}
          return true
        }

        // 3. Merge server cart + guest cart safely
        const merged = mergeCartItems(serverItems, guestItems)

        // 4. Authoritatively sync merged cart to MongoDB
        const syncRes = await syncServerCart(mapCartToServerItems(merged))

        if (syncRes && syncRes.success) {
          const finalItems = syncRes.cart?.items
            ? mapServerToCartItems(syncRes.cart.items)
            : merged
          setCartItems(finalItems)

          try {
            localStorage.setItem(getUserCartKey(userId), JSON.stringify(finalItems))
          } catch {}

          // 7. Remove temporary guest cart ONLY after successful synchronization
          try {
            localStorage.removeItem(GUEST_CART_STORAGE_KEY)
          } catch {}
          return true
        } else {
          // Sync failed or returned unsuccessful -> Preserve guest cart
          console.warn('[CartContext] syncServerCart returned unsuccessful, preserving guest cart')
          setCartItems(merged)
          return false
        }
      } catch (err) {
        console.error('[CartContext] Cart merge error:', err)
        return false
      } finally {
        isSyncingServerRef.current = false
        setIsCartLoading(false)
        mergeLockRef.current = null
      }
    })()

    mergeLockRef.current = task
    return task
  }

  // Synchronize cart state on user change (Login, Logout, Account Switching, Mount)
  useEffect(() => {
    // If auth state is still initializing on mount, wait before resolving cart
    if (isAuthLoading) return

    const previousUserId = previousUserIdRef.current
    previousUserIdRef.current = activeUserId

    // CASE 1: User Logged Out (was authenticated, now unauthenticated)
    if (previousUserId && !activeUserId) {
      isSyncingServerRef.current = true
      try {
        localStorage.removeItem(getUserCartKey(previousUserId))
        localStorage.removeItem('kala_cart')
        localStorage.removeItem(GUEST_CART_STORAGE_KEY)
      } catch {}
      setCartItems([])
      setIsCartLoading(false)
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
      // Check if there is a pending guest cart to merge
      const rawGuest = localStorage.getItem(GUEST_CART_STORAGE_KEY)
      let hasGuestItems = false
      if (rawGuest) {
        try {
          const parsed = JSON.parse(rawGuest)
          if (Array.isArray(parsed) && parsed.length > 0) {
            hasGuestItems = true
          }
        } catch {}
      }

      if (hasGuestItems) {
        // Deterministically merge guest cart into user's account
        mergeGuestCart(activeUserId)
        return
      }

      // No guest items: load cached version immediately if available
      setIsCartLoading(true)
      isSyncingServerRef.current = true
      try {
        const cached = localStorage.getItem(getUserCartKey(activeUserId))
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed)) {
            setCartItems(parsed)
          }
        }
      } catch {}

      // Authoritatively fetch the server cart from MongoDB
      fetchServerCart()
        .then((res) => {
          if (res && res.success && res.cart && Array.isArray(res.cart.items)) {
            const mappedItems = mapServerToCartItems(res.cart.items)
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
          setIsCartLoading(false)
        })
      return
    }

    // CASE 4: Unauthenticated / Guest state
    if (!activeUserId) {
      setIsCartLoading(false)
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
  }, [activeUserId, isAuthenticated, isAuthLoading])

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
    product: { id: string; name: string; image: string; price: number; color?: string },
    size: string,
    quantity: number,
    customization?: CartItemCustomization
  ) => {
    if (!size || quantity <= 0) return

    const validQuantity = Math.max(1, Math.floor(quantity))
    const cleanFrontText = customization?.frontText?.trim().slice(0, 50) || ''
    const cleanBackText = customization?.backText?.trim().slice(0, 50) || ''
    const hasCustomText = Boolean(cleanFrontText || cleanBackText)
    const customFee = hasCustomText ? 25 : 0
    const finalUnitPrice = product.price + (customization?.price !== undefined ? customization.price : customFee)

    const finalCustomization: CartItemCustomization | undefined = customization
      ? {
          ...customization,
          ...(cleanFrontText ? { frontText: cleanFrontText } : {}),
          ...(cleanBackText ? { backText: cleanBackText } : {}),
          ...(customFee > 0 && customization.price === undefined ? { price: customFee } : {}),
        }
      : hasCustomText
        ? {
            ...(cleanFrontText ? { frontText: cleanFrontText } : {}),
            ...(cleanBackText ? { backText: cleanBackText } : {}),
            price: customFee,
          }
        : undefined

    const itemColor = product.color || customization?.color || ''

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.productId === product.id &&
          item.size.trim().toUpperCase() === size.trim().toUpperCase() &&
          (!item.image || item.image === product.image) &&
          (item.color || '').trim().toLowerCase() === itemColor.trim().toLowerCase() &&
          (item.customization?.frontText || '') === cleanFrontText &&
          (item.customization?.backText || '') === cleanBackText &&
          (!item.customization?.artworkUrl || item.customization.artworkUrl === customization?.artworkUrl) &&
          (item.customization?.position || '') === (customization?.position || '')
      )

      let updated: CartItem[]
      if (existingIndex > -1) {
        updated = [...prevItems]
        const currentQty = updated[existingIndex].quantity
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + validQuantity,
          price: finalUnitPrice,
          color: itemColor,
          ...(finalCustomization ? { customization: finalCustomization } : {}),
        }
      } else {
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          image: product.image,
          price: finalUnitPrice,
          size,
          color: itemColor,
          quantity: validQuantity,
          ...(finalCustomization ? { customization: finalCustomization } : {}),
        }
        updated = [...prevItems, newItem]
      }

      // Synchronously persist immediately to storage to guarantee preservation before navigation
      try {
        const storageKey = getUserCartKey(activeUserId)
        localStorage.setItem(storageKey, JSON.stringify(updated))
      } catch {}

      return updated
    })

    // If authenticated, persist to MongoDB backend
    if (isAuthenticated && activeUserId) {
      addServerCartItem({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: finalUnitPrice,
        size,
        quantity: validQuantity,
        ...(finalCustomization ? { customization: finalCustomization } : {}),
      } as any).catch((err) => {
        console.warn('[CartContext] Failed to sync added item with server:', err)
      })
    }
  }

  const addMultipleToCart = (
    items: Array<{
      product: { id: string; name: string; image: string; price: number; color?: string }
      size: string
      quantity: number
      customization?: CartItemCustomization
    }>
  ) => {
    const validItems = items.filter((item) => item.size && item.quantity > 0)
    if (validItems.length === 0) return

    setCartItems((prevItems) => {
      let updated = [...prevItems]
      for (const entry of validItems) {
        const validQuantity = Math.max(1, Math.floor(entry.quantity))
        const cleanFrontText = entry.customization?.frontText?.trim().slice(0, 50) || ''
        const cleanBackText = entry.customization?.backText?.trim().slice(0, 50) || ''
        const hasCustomText = Boolean(cleanFrontText || cleanBackText)
        const customFee = hasCustomText ? 25 : 0
        const finalUnitPrice =
          entry.product.price +
          (entry.customization?.price !== undefined ? entry.customization.price : customFee)

        const finalCustomization: CartItemCustomization | undefined = entry.customization
          ? {
              ...entry.customization,
              ...(cleanFrontText ? { frontText: cleanFrontText } : {}),
              ...(cleanBackText ? { backText: cleanBackText } : {}),
              ...(customFee > 0 && entry.customization.price === undefined ? { price: customFee } : {}),
            }
          : hasCustomText
            ? {
                ...(cleanFrontText ? { frontText: cleanFrontText } : {}),
                ...(cleanBackText ? { backText: cleanBackText } : {}),
                price: customFee,
              }
            : undefined

        const itemColor = entry.product.color || entry.customization?.color || ''

        const existingIndex = updated.findIndex(
          (item) =>
            item.productId === entry.product.id &&
            item.size.trim().toUpperCase() === entry.size.trim().toUpperCase() &&
            (!item.image || item.image === entry.product.image) &&
            (item.color || '').trim().toLowerCase() === itemColor.trim().toLowerCase() &&
            (item.customization?.frontText || '') === cleanFrontText &&
            (item.customization?.backText || '') === cleanBackText &&
            (!item.customization?.artworkUrl ||
              item.customization.artworkUrl === entry.customization?.artworkUrl) &&
            (item.customization?.position || '') === (entry.customization?.position || '')
        )

        if (existingIndex > -1) {
          const currentQty = updated[existingIndex].quantity
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: currentQty + validQuantity,
            price: finalUnitPrice,
            color: itemColor,
            ...(finalCustomization ? { customization: finalCustomization } : {}),
          }
        } else {
          const newItem: CartItem = {
            productId: entry.product.id,
            name: entry.product.name,
            image: entry.product.image,
            price: finalUnitPrice,
            size: entry.size,
            color: itemColor,
            quantity: validQuantity,
            ...(finalCustomization ? { customization: finalCustomization } : {}),
          }
          updated.push(newItem)
        }
      }

      // Synchronously persist immediately to storage to guarantee preservation before navigation
      try {
        const storageKey = getUserCartKey(activeUserId)
        localStorage.setItem(storageKey, JSON.stringify(updated))
      } catch {}

      return updated
    })

    // If authenticated, persist to MongoDB backend sequentially to avoid document version conflicts
    if (isAuthenticated && activeUserId) {
      ;(async () => {
        for (const entry of validItems) {
          const validQuantity = Math.max(1, Math.floor(entry.quantity))
          const cleanFrontText = entry.customization?.frontText?.trim().slice(0, 50) || ''
          const cleanBackText = entry.customization?.backText?.trim().slice(0, 50) || ''
          const hasCustomText = Boolean(cleanFrontText || cleanBackText)
          const customFee = hasCustomText ? 25 : 0
          const finalUnitPrice =
            entry.product.price +
            (entry.customization?.price !== undefined ? entry.customization.price : customFee)

          const finalCustomization: CartItemCustomization | undefined = entry.customization
            ? {
                ...entry.customization,
                ...(cleanFrontText ? { frontText: cleanFrontText } : {}),
                ...(cleanBackText ? { backText: cleanBackText } : {}),
                ...(customFee > 0 && entry.customization.price === undefined
                  ? { price: customFee }
                  : {}),
              }
            : hasCustomText
              ? {
                  ...(cleanFrontText ? { frontText: cleanFrontText } : {}),
                  ...(cleanBackText ? { backText: cleanBackText } : {}),
                  price: customFee,
                }
              : undefined

          try {
            await addServerCartItem({
              productId: entry.product.id,
              name: entry.product.name,
              image: entry.product.image,
              price: finalUnitPrice,
              size: entry.size,
              quantity: validQuantity,
              ...(finalCustomization ? { customization: finalCustomization } : {}),
            } as any)
          } catch (err) {
            console.warn('[CartContext] Failed to sync added item with server:', err)
          }
        }
      })()
    }
  }

  const removeFromCart = (productId: string, size: string, image?: string, backText?: string) => {
    setCartItems((prevItems) => {
      const updated = prevItems.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.size.trim().toUpperCase() === size.trim().toUpperCase() &&
            (!image || item.image === image) &&
            (backText === undefined || (item.customization?.backText || '') === backText)
          )
      )
      try {
        const storageKey = getUserCartKey(activeUserId)
        localStorage.setItem(storageKey, JSON.stringify(updated))
      } catch {}
      return updated
    })

    // If authenticated, persist deletion to MongoDB backend
    if (isAuthenticated && activeUserId) {
      removeServerCartItem(productId, size, backText).catch((err) => {
        console.warn('[CartContext] Failed to sync removed item with server:', err)
      })
    }
  }

  const updateQuantity = (
    productId: string,
    size: string,
    quantity: number,
    image?: string,
    backText?: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, image, backText)
      return
    }

    const finalQuantity = Math.max(1, Math.floor(quantity))

    setCartItems((prevItems) => {
      const updated = prevItems.map((item) => {
        if (
          item.productId === productId &&
          item.size.trim().toUpperCase() === size.trim().toUpperCase() &&
          (!image || item.image === image) &&
          (backText === undefined || (item.customization?.backText || '') === backText)
        ) {
          return { ...item, quantity: finalQuantity }
        }
        return item
      })
      try {
        const storageKey = getUserCartKey(activeUserId)
        localStorage.setItem(storageKey, JSON.stringify(updated))
      } catch {}
      return updated
    })

    // If authenticated, persist quantity change to MongoDB backend
    if (isAuthenticated && activeUserId) {
      updateServerCartItemQty(productId, size, finalQuantity, backText).catch((err) => {
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
        isCartLoading,
        mergeGuestCart,
        addToCart,
        addMultipleToCart,
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
