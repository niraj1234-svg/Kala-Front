import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, SlidersHorizontal, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppralStore, appralStore } from '../store/appralStore';
import { cn } from '../lib/utils';
import type { Category, ProductListItem, ProductVariant } from '../store/appral';
import OptimizedImage from '../components/hustle-hour/OptimizedImage';

const FALLBACK_IMAGE = '/placeholder-product.png';
const PRODUCT_IMAGES = [
  '/1.jpeg', '/2.jpeg', '/3.jpeg', '/4.jpeg', '/5.jpeg', '/6.jpeg',
  '/7.jpeg', '/8.jpeg', '/9.jpeg', '/10.jpeg', '/11.jpeg', '/12.jpeg'
];

function getProductImage(product: ProductListItem): string {
  if (product.primary_image?.image_url && !product.primary_image.image_url.includes('placeholder')) {
    return product.primary_image.image_url;
  }
  // Use a consistent high-quality image from our pool based on product ID
  const index = Math.abs(product.id) % PRODUCT_IMAGES.length;
  const img = PRODUCT_IMAGES[index];
  return img || FALLBACK_IMAGE;
}

function normalizeColorHex(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!match) return null;
  const hex = match[1];
  const expanded = hex.length === 3 ? hex.split('').map((char) => `${char}${char}`).join('') : hex;
  return `#${expanded.toLowerCase()}`;
}

function buildVariantSwatches(variants?: ProductVariant[]): { key: string; color: string | null; label: string | null }[] {
  if (!variants || variants.length === 0) return [];
  const seen = new Set<string>();
  const swatches: { key: string; color: string | null; label: string | null }[] = [];
  variants.forEach((variant) => {
    const color = normalizeColorHex(variant.color_hex);
    const label = variant.color_name?.trim() || null;
    const key = color ?? label;
    if (!key || seen.has(key)) return;
    seen.add(key);
    swatches.push({ key, color, label });
  });
  return swatches;
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function extractPrice(product: ProductListItem): number {
  return Number.parseFloat(product.price ?? '0');
}

const ProductsListingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const productsState = useAppralStore((state) => state.products);
  const categoriesState = useAppralStore((state) => state.categories);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (!productsState.loading && productsState.data.length === 0) {
      appralStore.fetchProducts().catch(console.error);
    }
  }, [productsState.data.length, productsState.loading]);

  useEffect(() => {
    if (!categoriesState.loading && categoriesState.data.length === 0) {
      appralStore.fetchCategories().catch(console.error);
    }
  }, [categoriesState.data.length, categoriesState.loading]);

  const products = productsState.data;

  const priceBounds = useMemo(() => {
    const prices = products.map(extractPrice).filter((v) => Number.isFinite(v) && v >= 0);
    return prices.length === 0 ? { min: 0, max: 0 } : { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  useEffect(() => {
    if (priceBounds.max > 0) {
      setPriceRange((prev) => (prev[1] === 0 ? [priceBounds.min, priceBounds.max] : prev));
    }
  }, [priceBounds]);

  const flattenedCategories = useMemo(() => {
    const result: { name: string; slug: string }[] = [];
    const traverse = (c: Category) => {
      result.push({ name: c.name, slug: c.slug });
      c.children?.forEach(traverse);
    };
    categoriesState.data.forEach(traverse);
    return result;
  }, [categoriesState.data]);

  const activeCategory = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('category') ?? 'all';
  }, [location.search]);

  const filteredProducts = useMemo(() => {
    let items = [...products];
    if (activeCategory !== 'all') items = items.filter((p) => p.category === activeCategory);
    items = items.filter((p) => {
      const v = extractPrice(p);
      return v >= priceRange[0] && v <= (priceRange[1] || Infinity);
    });
    if (showInStockOnly) items = items.filter((p) => p.in_stock);

    switch (sortBy) {
      case 'price-low': items.sort((a, b) => extractPrice(a) - extractPrice(b)); break;
      case 'price-high': items.sort((a, b) => extractPrice(b) - extractPrice(a)); break;
      case 'name': items.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return items;
  }, [activeCategory, priceRange, products, showInStockOnly, sortBy]);

  const clearFilters = () => {
    setShowInStockOnly(false);
    setSortBy('featured');
    setPriceRange([priceBounds.min, priceBounds.max]);
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      {/* Grain Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* NEW Premium Hero Section */}
      <section className="relative h-[80vh] lg:h-[90vh] w-full overflow-hidden bg-foreground">
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            src={activeCategory === 'all' ? '/5.jpeg' : getProductImage({ id: activeCategory.length, primary_image: null } as any)}
            alt="Products Hero"
            className="h-full w-full object-cover animate-hzoom scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 lg:px-20 pb-16 lg:pb-24 pt-32 lg:pt-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-12 h-[1px] bg-accent" />
            <span className="text-[10px] font-body tracking-[0.4em] uppercase text-accent/80 font-bold">New Collectibles</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
              className="font-display text-[clamp(50px,10vw,140px)] leading-[0.9] tracking-[-0.03em] uppercase text-white drop-shadow-2xl mt-8"
            >
              {activeCategory === 'all' ? (
                <>
                  THE<br />
                  <span className="text-accent italic font-serif lowercase tracking-normal">latest</span><br />
                  DROP
                </>
              ) : activeCategory.replace(/-/g, ' ')}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-[320px] lg:pb-4 border-l border-white/20 pl-8"
            >
              <p className="font-body text-[11px] tracking-[0.2em] uppercase text-white/60 mb-4 leading-relaxed">
                Reclaiming the moment of execution through curated artifacts and artistic expression.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl text-accent">{filteredProducts.length}</span>
                <span className="font-body text-[9px] tracking-[0.3em] uppercase text-white/40">Entities Tracked</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Subnav - Sticky and Refined */}
      <div className="sticky top-0 z-[1001] bg-background/90 backdrop-blur-xl border-b border-foreground/5 shadow-sm">
        <div className="px-6 md:px-12 lg:px-20 flex items-center justify-between">
          <div className="no-scrollbar flex overflow-x-auto gap-12 py-6">
            <button
              onClick={() => navigate('/products')}
              className={cn(
                "whitespace-nowrap font-body text-[10px] tracking-[0.4em] uppercase transition-all relative py-1",
                activeCategory === 'all' ? "text-foreground font-bold" : "text-foreground/40 hover:text-foreground"
              )}
            >
              All Items
              {activeCategory === 'all' && (
                <motion.div layoutId="activeCat" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent" />
              )}
            </button>
            {flattenedCategories.map((c) => (
              <button
                key={c.slug}
                onClick={() => navigate(`/products?category=${c.slug}`)}
                className={cn(
                  "whitespace-nowrap font-body text-[10px] tracking-[0.4em] uppercase transition-all relative py-1",
                  activeCategory === c.slug ? "text-foreground font-bold" : "text-foreground/40 hover:text-foreground"
                )}
              >
                {c.name}
                {activeCategory === c.slug && (
                  <motion.div layoutId="activeCat" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 border-l border-foreground/5 pl-8 py-4">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-3 group"
            >
              <SlidersHorizontal className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline font-body text-[10px] tracking-[0.3em] uppercase group-hover:text-accent transition-colors">Filters</span>
            </button>

            <div className="relative group">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-3"
              >
                <span className="hidden sm:inline font-body text-[10px] tracking-[0.3em] uppercase">Sort</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isSortOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-4 w-48 bg-background border border-foreground/10 shadow-2xl z-50 p-2"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-3 font-body text-[9px] tracking-[0.2em] uppercase transition-colors",
                          sortBy === opt.value ? "bg-accent text-background" : "hover:bg-foreground/5"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="px-6 md:px-12 lg:px-20">
        {productsState.loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[3/4] bg-foreground/5" />
                <div className="h-4 bg-foreground/5 w-2/3" />
                <div className="h-3 bg-foreground/5 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-40 text-center border border-dashed border-foreground/10">
            <h3 className="font-display text-4xl uppercase tracking-tighter mb-4">No results found</h3>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-8">Try adjusting your filters or browsing other categories.</p>
            <button onClick={clearFilters} className="font-body text-[10px] tracking-[0.3em] uppercase px-8 py-3 border border-foreground hover:bg-foreground hover:text-background transition-all">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 lg:gap-x-12 gap-y-16">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 4) * 0.1 }}
                className="group cursor-pointer"
                onMouseEnter={() => setActiveProduct(product.id)}
                onMouseLeave={() => setActiveProduct(null)}
              >
                <Link to={`/products/${product.slug}`}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-cream/30 mb-6">
                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-foreground text-background text-[8px] font-body font-bold tracking-[0.3em] px-3 py-1 uppercase">
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* Main Image */}
                    <OptimizedImage
                      src={getProductImage(product)}
                      alt={product.name}
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-1000 ease-out",
                        activeProduct === product.id ? "scale-110" : "scale-100"
                      )}
                    />

                    {/* Quick Add Overlay (Mockup style) */}
                    <div className={cn(
                      "absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none",
                      activeProduct === product.id && "opacity-100"
                    )}>
                      <span className="font-body text-[9px] tracking-[0.4em] uppercase text-white border-b border-white pb-1">View Details</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-display text-2xl tracking-tighter leading-none uppercase group-hover:text-accent transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <span className="font-body text-xs font-semibold whitespace-nowrap">
                        {formatCurrency(extractPrice(product))}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-body tracking-[0.3em] uppercase text-foreground/40 italic">
                        {product.category.replace(/-/g, ' ')}
                      </span>

                      {/* Swatches */}
                      {(() => {
                        const swatches = buildVariantSwatches(product.variants);
                        if (swatches.length === 0) return null;
                        return (
                          <div className="flex gap-1.5 grayscale opacity-60">
                            {swatches.slice(0, 3).map((s) => (
                              <div
                                key={s.key}
                                className="w-2 h-2 rounded-full border border-foreground/10"
                                style={s.color ? { backgroundColor: s.color } : { backgroundColor: '#ccc' }}
                              />
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Filter Sidebar (Mobile & Desktop Drawer) */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[2000]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-foreground/5 shadow-2xl p-10 flex flex-col"
            >
              <div className="flex items-center justify-between mb-20">
                <h3 className="font-display text-4xl tracking-tighter uppercase">Filter Artifacts</h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:opacity-50 transition-opacity">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-16">
                {/* Price Range */}
                <div className="space-y-8">
                  <span className="text-[9px] font-body tracking-[0.4em] uppercase text-accent">Valuation</span>
                  <div className="space-y-6">
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-accent"
                    />
                    <div className="flex justify-between font-body text-[10px] tracking-[0.2em] uppercase">
                      <span>{formatCurrency(priceBounds.min)}</span>
                      <span className="text-xl font-display tracking-tighter">Up to {formatCurrency(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Toggle */}
                <div className="space-y-8">
                  <span className="text-[9px] font-body tracking-[0.4em] uppercase text-accent">Availability</span>
                  <button
                    onClick={() => setShowInStockOnly(!showInStockOnly)}
                    className="flex items-center justify-between w-full group"
                  >
                    <span className="font-body text-xs tracking-[0.1em] uppercase">In Stock Artifacts Only</span>
                    <div className={cn(
                      "w-10 h-5 border border-foreground/20 relative transition-colors duration-300",
                      showInStockOnly ? "bg-accent border-accent" : "bg-transparent"
                    )}>
                      <motion.div
                        animate={{ x: showInStockOnly ? 20 : 2 }}
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-[1px] bg-foreground transition-colors"
                        style={{ backgroundColor: showInStockOnly ? '#000' : '#444' }}
                      />
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-10 border-t border-foreground/5 space-y-4">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-foreground text-background py-5 font-body text-[10px] tracking-[0.4em] uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
                >
                  Apply Filters <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full border border-foreground/10 py-5 font-body text-[10px] tracking-[0.4em] uppercase hover:bg-foreground/5 transition-colors"
                >
                  Reset All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type='range'] {
          -webkit-appearance: none;
          height: 1px;
          background: rgba(0,0,0,0.1);
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: #000;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default ProductsListingPage;