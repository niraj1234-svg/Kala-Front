import React, { createContext, useContext, useState, useEffect } from 'react'

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

const CART_STORAGE_KEY = 'kala_cart'

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart state safely from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (err) {
      console.warn('Failed to parse cart from localStorage, initializing empty cart:', err)
    }
    return []
  })

  // Synchronize cart with localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err)
    }
  }, [cartItems])

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

    setCartItems((prevItems) => {
      // Find matching item with SAME productId AND SAME size
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product.id && item.size === size
      )

      if (existingIndex > -1) {
        // Combine by adding quantity (capped at 10 max)
        const updated = [...prevItems]
        const currentQty = updated[existingIndex].quantity
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(currentQty + quantity, 10),
        }
        return updated
      } else {
        // Add as a separate new line item
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          size,
          quantity: Math.min(quantity, 10),
        }
        return [...prevItems, newItem]
      }
    })
  }

  const removeFromCart = (productId: string, size: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && item.size === size)
      )
    )
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
  }

  const clearCart = () => {
    setCartItems([])
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
