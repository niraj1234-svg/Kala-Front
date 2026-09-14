import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from './lib/api';
import { useCart } from './CartContext';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
  moveToCart: (product: Product, size?: string, color?: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('kala_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { addToCart } = useCart();

  useEffect(() => {
    try {
      localStorage.setItem('kala_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('Failed to persist wishlist to localStorage', e);
    }
  }, [wishlistItems]);

  const addToWishlist = (product: Product) => {
    setWishlistItems(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(p => p.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(p => p.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const getWishlistCount = (): number => {
    return wishlistItems.length;
  };

  const moveToCart = (product: Product, size?: string, color?: string) => {
    const selectedSize = size || (product.availableSizes && product.availableSizes[0]) || 'Standard';
    const selectedColor = color || (product.availableColors && product.availableColors[0]) || 'Standard';
    
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      size: selectedSize,
      color: selectedColor,
      image: product.image,
      quantity: 1,
      category: product.category,
      subCategory: product.subCategory
    });

    removeFromWishlist(product.id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        getWishlistCount,
        moveToCart,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
