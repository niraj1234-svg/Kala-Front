import { useState } from 'react';
import type { Product } from '../lib/api';

const MAX_ITEMS = 10;
const STORAGE_KEY = 'kala_recently_viewed';

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recordProductView = (product: Product) => {
    if (!product || !product.id) return;
    setRecentProducts(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed storing recently viewed product', e);
      }
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentProducts([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    recentProducts,
    recordProductView,
    clearRecentlyViewed,
  };
}

export default useRecentlyViewed;
