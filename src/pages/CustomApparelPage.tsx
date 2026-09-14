import React, { useState, useEffect } from 'react';
import { Filter, Sparkles, Plus } from 'lucide-react';
import { KALA_PRODUCTS, type KalaProduct } from '../constants/products';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import CustomApparelOrderModal from '../components/CustomApparelOrderModal';

const DESIGN_CATEGORIES = [
  'All',
  'Streetwear',
  'Gym',
  'Gaming',
  'Minimal',
  'Custom Art',
  'Teams',
  'Community'
];

export const CustomApparelPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<KalaProduct[]>(() =>
    KALA_PRODUCTS.filter(p => p.category === 'Apparel')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProductType, setModalProductType] = useState('Oversized T-Shirt');

  useEffect(() => {
    async function loadApparel() {
      setIsLoading(true);
      try {
        const query: any = { category: 'Apparel' };
        if (selectedCategory !== 'All') {
          query.designCategory = selectedCategory;
        }
        const res = await api.getProducts(query);
        if (res && res.products && res.products.length > 0) {
          setProducts(res.products as KalaProduct[]);
        } else {
          // Fallback to local
          const filtered = KALA_PRODUCTS.filter(p => {
            if (p.category !== 'Apparel') return false;
            if (selectedCategory !== 'All' && p.designCategory !== selectedCategory) return false;
            return true;
          });
          setProducts(filtered);
        }
      } catch (err) {
        const filtered = KALA_PRODUCTS.filter(p => {
          if (p.category !== 'Apparel') return false;
          if (selectedCategory !== 'All' && p.designCategory !== selectedCategory) return false;
          return true;
        });
        setProducts(filtered);
      } finally {
        setIsLoading(false);
      }
    }
    loadApparel();
  }, [selectedCategory]);

  const openOrderModal = (type = 'Oversized T-Shirt') => {
    setModalProductType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-kala-emerald dark:text-emerald-400 block">
            CUSTOM APPAREL
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-black uppercase text-foreground leading-[1]">
            Wear something that's yours.
          </h1>
          <p className="font-body text-sm sm:text-base text-mid max-w-xl mx-auto leading-relaxed">
            Custom tees, jerseys, and merchandise with zero minimum orders.
          </p>

          {/* Primary Action Button opens Native Modal (Rule 35) */}
          <div className="pt-4">
            <button
              onClick={() => openOrderModal('Oversized T-Shirt')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Start Custom Order</span>
            </button>
            <p className="text-[11px] text-mid mt-2 font-mono">
              Tell us your idea — we handle the design and print.
            </p>
          </div>
        </div>

        {/* Category Filters: 8 Core Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mid">
            <Filter className="w-3.5 h-3.5" />
            <span>Categories</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
            {DESIGN_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-kala-emerald text-white border-kala-emerald shadow-sm'
                    : 'bg-card border-border hover:border-foreground/40 text-mid hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-3/4 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 bg-card border border-border rounded-3xl p-8">
            <p className="font-serif text-xl font-bold text-foreground">No designs currently in this category.</p>
            <p className="text-xs text-mid max-w-sm mx-auto">
              Want a custom apparel design created from scratch? Click below to tell our design team.
            </p>
            <button
              onClick={() => openOrderModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-kala-emerald text-white text-xs font-bold uppercase tracking-widest rounded-xl"
            >
              <span>Submit Custom Design Spec</span>
            </button>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <Sparkles className="w-8 h-8 text-kala-emerald dark:text-emerald-400 mx-auto" />
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-foreground uppercase">
            Need something completely custom?
          </h2>
          <p className="text-sm text-mid max-w-lg mx-auto">
            From solo streetwear drops to college team merchandise.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openOrderModal()}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Start Custom Order</span>
            </button>
          </div>
        </div>

        {/* Native Custom Apparel Order Modal */}
        <CustomApparelOrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialProductType={modalProductType}
        />
      </div>
    </div>
  );
};

export default CustomApparelPage;
