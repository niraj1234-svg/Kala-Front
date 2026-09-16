import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { PRODUCTS } from '../data/products'
import type { Product } from '../data/products'

export interface WishlistContextType {
  wishlistIds: string[]
  wishlistItems: Product[]
  wishlistCount: number
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  toggleWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

const WISHLIST_STORAGE_KEY = 'kala_wishlist'

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize wishlist IDs from localStorage with error tolerance
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          // Filter out any IDs that don't exist in product catalog
          const validProductIds = new Set(PRODUCTS.map((p) => p.id))
          return parsed.filter((id) => typeof id === 'string' && validProductIds.has(id))
        }
      }
    } catch (err) {
      console.warn('Failed to parse wishlist from localStorage, initializing empty wishlist:', err)
    }
    return []
  })

  // Synchronize state with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds))
    } catch (err) {
      console.error('Failed to save wishlist to localStorage:', err)
    }
  }, [wishlistIds])

  // Resolve valid product objects from product IDs
  const wishlistItems = useMemo(() => {
    return wishlistIds
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter((product): product is Product => Boolean(product))
  }, [wishlistIds])

  const wishlistCount = wishlistItems.length

  const isInWishlist = (productId: string): boolean => {
    return wishlistIds.includes(productId)
  }

  const addToWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) return prev // Prevent duplicates
      return [...prev, productId]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId))
  }

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  const clearWishlist = () => {
    setWishlistIds([])
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
