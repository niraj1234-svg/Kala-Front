import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface CartItem {
  id: string; // product id
  cartItemId: string; // unique `${id}-${size}-${color}`
  name: string;
  slug?: string;
  price: number;
  salePrice?: number | null;
  size: string;
  color: string;
  image: string;
  quantity: number;
  category?: string;
  subCategory?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartItemId'>, showDrawer?: boolean) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  lastAddedItem: CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('kala_cart') || localStorage.getItem('cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Ensure each item has a cartItemId
      return parsed.map((it: any) => ({
        ...it,
        cartItemId: it.cartItemId || `${it.id}-${it.size || 'M'}-${it.color || 'Standard'}`,
      }));
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('kala_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed saving cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'cartItemId'>, showDrawer = true) => {
    const size = item.size || 'Standard';
    const color = item.color || 'Standard';
    const cartItemId = `${item.id}-${size}-${color}`;
    const fullItem: CartItem = { ...item, size, color, cartItemId };

    setCartItems(prev => {
      const existingIdx = prev.findIndex(ci => ci.cartItemId === cartItemId);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += (item.quantity || 1);
        return updated;
      }
      return [...prev, fullItem];
    });

    setLastAddedItem(fullItem);
    if (showDrawer) {
      setIsDrawerOpen(true);
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(ci => ci.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(ci => (ci.cartItemId === cartItemId ? { ...ci, quantity } : ci))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  };

  const getCartCount = (): number => {
    return cartItems.reduce((acc, it) => acc + it.quantity, 0);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;