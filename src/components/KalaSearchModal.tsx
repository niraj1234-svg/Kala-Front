import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, type Product } from '../lib/api';
import { KALA_PRODUCTS } from '../constants/products';

interface KalaSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KalaSearchModal: React.FC<KalaSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const q = searchTerm.toLowerCase().trim();
      const getLocalMatches = () =>
        (KALA_PRODUCTS as unknown as Product[]).filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subCategory?.toLowerCase().includes(q) ||
          p.designCategory?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (p as any).tags?.some((t: string) => t.toLowerCase().includes(q))
        ).slice(0, 6);

      try {
        const res = await api.getProducts({ search: searchTerm });
        if (res && res.products && res.products.length > 0) {
          setResults(res.products.slice(0, 6));
        } else {
          setResults(getLocalMatches());
        }
      } catch (err) {
        setResults(getLocalMatches());
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleProductClick = (productId: string) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-20 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <form onSubmit={handleFullSearch} className="flex items-center px-4 py-3.5 border-b border-border gap-3">
              <Search className="w-5 h-5 text-mid" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search KALA products..."
                className="w-full bg-transparent text-foreground text-sm focus:outline-none placeholder:text-mid"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-mid hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-mid hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Quick Suggestions & Results */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-mid">Searching catalog...</div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-mid px-2 mb-2">
                    Top Results ({results.length})
                  </div>
                  {results.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-black/5 dark:bg-white/5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-mid uppercase">{product.subCategory}</span>
                          {product.isSoldOut && (
                            <span className="text-[9px] font-bold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">
                              SOLD OUT
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-foreground truncate group-hover:text-kala-emerald transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs font-semibold text-kala-emerald dark:text-emerald-400">
                          ₹{product.price}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-mid opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}

                  <div className="pt-3 border-t border-border text-center">
                    <button
                      onClick={handleFullSearch}
                      className="text-xs font-bold text-kala-emerald dark:text-emerald-400 uppercase tracking-wider hover:underline"
                    >
                      View all results in shop &rarr;
                    </button>
                  </div>
                </div>
              ) : searchTerm ? (
                <div className="py-8 text-center space-y-3">
                  <h4 className="text-base font-serif font-bold text-foreground">
                    We couldn't find what you're looking for.
                  </h4>
                  <p className="text-xs text-mid max-w-sm mx-auto">
                    Try another search or explore our collections.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/shop');
                      }}
                      className="px-4 py-2 bg-card hover:bg-black/5 dark:hover:bg-white/5 border border-border text-foreground text-xs font-bold uppercase tracking-wider rounded-lg"
                    >
                      Explore Shop Collections
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/custom-apparel');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-kala-emerald text-white text-xs font-bold uppercase tracking-wider rounded-lg"
                    >
                      Custom Request &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-mid">
                    Popular Categories
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Oversized T-Shirts',
                      'Streetwear',
                      'Gym Sets',
                      'Esports Jerseys',
                      'Carry Bags',
                      'Die-Cut Stickers',
                      'Business Cards',
                      'Thank-You Cards'
                    ].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchTerm(tag);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-medium rounded-lg text-foreground transition-colors"
                      >
                        <Tag className="w-3 h-3 text-mid" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KalaSearchModal;
