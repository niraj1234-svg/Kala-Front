import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { KALA_PRODUCTS, type KalaProduct } from '../constants/products';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const PRIMARY_CATEGORIES = ['All', 'Apparel', 'Business Branding'];

const SUB_CATEGORIES: Record<string, string[]> = {
  Apparel: ['All', 'Oversized T-Shirts', 'T-Shirts', 'Jerseys', 'Polo T-Shirts'],
  'Business Branding': ['All', 'Carry Bags', 'Stickers', 'Thank-you Cards', 'Polo T-Shirts'],
};

const DESIGN_COLLECTIONS = [
  'All Collections',
  'Streetwear',
  'Gym',
  'Gaming',
  'Minimal',
  'Custom Art',
  'Teams',
  'Community'
];

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<KalaProduct[]>(KALA_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('subCategory') || 'All');
  const [selectedCollection, setSelectedCollection] = useState(searchParams.get('collection') || 'All Collections');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'inStock' | 'soldOut'>('all');
  const [sortOption, setSortOption] = useState<'featured' | 'newest' | 'price_asc' | 'price_desc'>('featured');
  const [priceMax, setPriceMax] = useState<number>(2500);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<KalaProduct | null>(null);

  // Recently Viewed hook
  const { recentProducts } = useRecentlyViewed();

  // Load from API with graceful fallback to KALA_PRODUCTS
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const query: any = {};
        if (selectedCategory !== 'All') query.category = selectedCategory;
        if (selectedSubCategory !== 'All') query.subCategory = selectedSubCategory;
        if (selectedCollection !== 'All Collections') query.designCategory = selectedCollection;
        if (searchTerm.trim()) query.search = searchTerm.trim();
        query.sort = sortOption;

        const res = await api.getProducts(query);
        if (res && res.products && res.products.length > 0) {
          setProducts(res.products as KalaProduct[]);
        } else {
          setProducts(KALA_PRODUCTS);
        }
      } catch (err) {
        // Fallback to local catalog
        setProducts(KALA_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategory, selectedSubCategory, selectedCollection, searchTerm, sortOption]);

  // Client-side refined filtering & sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Sub-category filter
    if (selectedSubCategory !== 'All') {
      list = list.filter(p => p.subCategory === selectedSubCategory);
    }

    // Collection filter
    if (selectedCollection !== 'All Collections') {
      list = list.filter(p => p.designCategory?.toLowerCase() === selectedCollection.toLowerCase());
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q) ||
        p.designCategory?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Availability filter
    if (availabilityFilter === 'inStock') {
      list = list.filter(p => !p.isSoldOut && p.inStock);
    } else if (availabilityFilter === 'soldOut') {
      list = list.filter(p => p.isSoldOut);
    }

    // Price filter
    list = list.filter(p => p.price <= priceMax);

    // Sorting
    if (sortOption === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Featured
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return list;
  }, [products, selectedCategory, selectedSubCategory, selectedCollection, searchTerm, availabilityFilter, priceMax, sortOption]);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setSelectedCollection('All Collections');
    setSearchTerm('');
    setAvailabilityFilter('all');
    setPriceMax(2500);
    setSortOption('featured');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Hero Header (Rule 5) */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-kala-emerald dark:text-emerald-400 block">
            KALA ONLINE CATALOG
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black uppercase text-foreground leading-[0.95]">
            Shop KALA
          </h1>
          <p className="font-body text-sm sm:text-base text-mid max-w-2xl leading-relaxed">
            Discover apparel and designs made to express your identity.
          </p>
        </div>

        {/* Top Control Bar: Search & Filter Toggles */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          {/* Live Search Bar (Rule 4) */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-mid absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search KALA products, collections, designs..."
              className="w-full bg-background border border-border rounded-xl pl-10 pr-8 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mid hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            {/* Mobile Filter Sheet Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2 bg-background border border-border rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sorting Dropdown (Rule 67) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-mid hidden sm:inline">Sort by:</span>
              <select
                value={sortOption}
                onChange={(e: any) => setSortOption(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Primary Categories Tabs (Rule 6) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none">
          {PRIMARY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedSubCategory('All');
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-kala-emerald text-white border-kala-emerald shadow-xs'
                  : 'bg-card border-border hover:border-foreground/40 text-mid hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sub-Category Pills */}
        {selectedCategory !== 'All' && SUB_CATEGORIES[selectedCategory] && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-[11px] font-mono text-mid uppercase mr-1">Type:</span>
            {SUB_CATEGORIES[selectedCategory].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubCategory(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                  selectedSubCategory === sub
                    ? 'bg-foreground text-background border-foreground font-bold'
                    : 'bg-background border-border text-mid hover:text-foreground'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Collections Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[11px] font-mono text-mid uppercase mr-1">Theme:</span>
          {DESIGN_COLLECTIONS.map((col) => (
            <button
              key={col}
              onClick={() => setSelectedCollection(col)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                selectedCollection === col
                  ? 'bg-kala-earth text-white border-kala-earth font-bold'
                  : 'bg-card border-border text-mid hover:text-foreground'
              }`}
            >
              {col}
            </button>
          ))}
        </div>

        {/* Main Discovery Grid: Sidebar + Product Grid (Rule 65 & 68) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar (Rule 68) */}
          <div className="hidden lg:block bg-card border border-border rounded-3xl p-6 space-y-6 sticky top-28 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-lg font-bold text-foreground uppercase">
                Filter Catalog
              </h3>
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-mid hover:text-kala-emerald underline font-mono"
              >
                Reset All
              </button>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                Availability
              </label>
              <div className="space-y-1.5 text-xs text-mid">
                {[
                  { id: 'all', label: 'All Products' },
                  { id: 'inStock', label: 'In Stock Only' },
                  { id: 'soldOut', label: 'Archive / Sold Out' }
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    <input
                      type="radio"
                      name="avail"
                      checked={availabilityFilter === item.id}
                      onChange={() => setAvailabilityFilter(item.id as any)}
                      className="accent-kala-emerald"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Max Slider */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold uppercase tracking-wider text-foreground">Max Price</label>
                <span className="font-mono text-kala-emerald font-bold">₹{priceMax}</span>
              </div>
              <input
                type="range"
                min="300"
                max="2500"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-kala-emerald cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-mid font-mono">
                <span>₹300</span>
                <span>₹2500</span>
              </div>
            </div>

            {/* Result count */}
            <div className="pt-2 border-t border-border text-xs text-mid font-mono">
              Showing {filteredProducts.length} KALA products
            </div>
          </div>

          {/* Products Grid Column (Rule 65: Desktop 3 col within grid = 4 row items if full, mobile 2) */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-3/4 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            ) : (
              /* No Results State (Rule 4) */
              <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-mid">
                  <Search className="w-7 h-7 opacity-60" />
                </div>
                <h3 className="font-serif text-2xl font-bold uppercase text-foreground">
                  We couldn't find what you're looking for.
                </h3>
                <p className="text-xs sm:text-sm text-mid max-w-md mx-auto leading-relaxed">
                  Try another search term or explore our streetwear, gym, and gaming collections.
                </p>
                <div className="pt-2">
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Reset Filters & View All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Section (Rule 15 & 39) */}
        {recentProducts && recentProducts.length > 0 && (
          <div className="pt-16 border-t border-border space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-mid block">
                  BROWSED RECENTLY
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-foreground">
                  Recently Viewed
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recentProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={(prod) => setQuickViewProduct(prod)} />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-xs bg-card border-l border-border h-full p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="font-serif text-lg font-bold uppercase text-foreground">Filters</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 text-mid hover:text-foreground rounded-lg"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                    Availability
                  </label>
                  <div className="space-y-2 text-xs text-mid">
                    {[
                      { id: 'all', label: 'All Products' },
                      { id: 'inStock', label: 'In Stock Only' },
                      { id: 'soldOut', label: 'Archive / Sold Out' }
                    ].map((item) => (
                      <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mobile-avail"
                          checked={availabilityFilter === item.id}
                          onChange={() => setAvailabilityFilter(item.id as any)}
                          className="accent-kala-emerald"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Max Slider */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold uppercase tracking-wider text-foreground">Max Price</label>
                    <span className="font-mono text-kala-emerald font-bold">₹{priceMax}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="2500"
                    step="50"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-kala-emerald cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-mid font-mono">
                    <span>₹300</span>
                    <span>₹2500</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-2.5 bg-background border border-border text-foreground rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2.5 bg-kala-emerald text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick View Modal */}
        <ProductQuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      </div>
    </div>
  );
};

export default ShopPage;
