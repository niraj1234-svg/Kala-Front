import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppralStore, appralStore } from '../store/appralStore';
import type { Category, ProductListItem } from '../store/appral';

const FALLBACK_IMAGE = '/placeholder-product.png';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) {
    return '₹0';
  }
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `₹${value.toFixed(0)}`;
  }
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
      appralStore.fetchProducts().catch((error) => {
        console.error('Failed to load products', error);
      });
    }
  }, [productsState.data.length, productsState.loading]);

  useEffect(() => {
    if (!categoriesState.loading && categoriesState.data.length === 0) {
      appralStore.fetchCategories().catch((error) => {
        console.error('Failed to load categories', error);
      });
    }
  }, [categoriesState.data.length, categoriesState.loading]);

  const products = productsState.data;

  const priceBounds = useMemo(() => {
    const prices = products
      .map(extractPrice)
      .filter((value) => Number.isFinite(value) && value >= 0);
    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  useEffect(() => {
    if (priceBounds.max === 0) {
      setPriceRange([0, 0]);
      return;
    }
    setPriceRange((prev) => {
      if (prev[1] === 0 || prev[1] === prev[0]) {
        return [priceBounds.min, priceBounds.max];
      }
      return [
        Math.max(priceBounds.min, prev[0]),
        Math.min(priceBounds.max, prev[1]),
      ];
    });
  }, [priceBounds.max, priceBounds.min]);

  const flattenedCategories = useMemo(() => {
    const result: { name: string; slug: string }[] = [];
    const traverse = (category: Category) => {
      result.push({ name: category.name, slug: category.slug });
      category.children?.forEach(traverse);
    };
    categoriesState.data.forEach(traverse);
    return result;
  }, [categoriesState.data]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    flattenedCategories.forEach((entry) => map.set(entry.slug, entry.name));
    return map;
  }, [flattenedCategories]);

  const activeCategory = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('category') ?? 'all';
  }, [location.search]);

  const categoryTabs = useMemo(
    () => [{ name: 'All', slug: 'all' }, ...flattenedCategories],
    [flattenedCategories],
  );

  const handleCategoryChange = (slug: string) => {
    if (slug === 'all') {
      navigate('/products');
    } else {
      navigate(`/products?category=${slug}`);
    }
  };

  const effectivePriceRange: [number, number] = useMemo(() => {
    if (priceRange[1] === 0 && priceBounds.max > 0) {
      return [priceBounds.min, priceBounds.max];
    }
    return priceRange;
  }, [priceBounds.max, priceBounds.min, priceRange]);

  const filteredProducts = useMemo(() => {
    const [minPrice, maxPrice] = effectivePriceRange;
    let items: ProductListItem[] = [...products];

    if (activeCategory !== 'all') {
      items = items.filter((product) => product.category === activeCategory);
    }

    items = items.filter((product) => {
      const value = extractPrice(product);
      if (!Number.isFinite(value)) {
        return true;
      }
      return value >= minPrice && value <= maxPrice;
    });

    if (showInStockOnly) {
      items = items.filter((product) => product.in_stock);
    }

    switch (sortBy) {
      case 'price-low':
        items.sort((a, b) => extractPrice(a) - extractPrice(b));
        break;
      case 'price-high':
        items.sort((a, b) => extractPrice(b) - extractPrice(a));
        break;
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return items;
  }, [activeCategory, effectivePriceRange, products, showInStockOnly, sortBy]);

  const activeFiltersCount = useMemo(() => {
    const [minPrice, maxPrice] = effectivePriceRange;
    const priceFilterActive =
      priceBounds.max > 0 &&
      (minPrice > priceBounds.min || maxPrice < priceBounds.max);
    return (
      (activeCategory !== 'all' ? 1 : 0) +
      (priceFilterActive ? 1 : 0) +
      (showInStockOnly ? 1 : 0)
    );
  }, [activeCategory, effectivePriceRange, priceBounds.max, priceBounds.min, showInStockOnly]);

  const clearFilters = () => {
    setShowInStockOnly(false);
    setSortBy('featured');
    setPriceRange([priceBounds.min, priceBounds.max]);
    navigate('/products');
  };

  const renderProductCard = (product: ProductListItem, index: number) => {
    const animationDelay = Math.min(index, 10) * 80;
    const imageUrl = product.primary_image?.image_url ?? FALLBACK_IMAGE;
    const priceLabel = formatCurrency(extractPrice(product));
    const categoryLabel = categoryMap.get(product.category) ?? product.category;

    return (
      <Link
        key={product.id}
        to={`/products/${product.slug}`}
        className="group block"
        onMouseEnter={() => setActiveProduct(product.id)}
        onMouseLeave={() => setActiveProduct(null)}
        style={{
          animation: 'fadeInUp 0.45s ease-out',
          animationDelay: `${animationDelay}ms`,
          animationFillMode: 'forwards',
        }}
      >
        <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {product.badge && (
            <div className="absolute top-2 left-2 z-20">
              <span
                className={`text-xs font-bold px-2 py-1 uppercase tracking-wider ${
                  product.badge === 'SOLD OUT'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-black'
                }`}
              >
                {product.badge}
              </span>
            </div>
          )}

          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                activeProduct === product.id ? 'scale-105' : 'scale-100'
              }`}
              loading="lazy"
              onError={(event) => {
                (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
          </div>

          <div className="p-3 sm:p-4 space-y-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm sm:text-base font-semibold">{priceLabel}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              {categoryLabel}
            </p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
      <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">Products</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b bg-white">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Shop All</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {productsState.loading
            ? 'Loading products...'
            : `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} available`}
        </p>
        {productsState.error && (
          <p className="mt-2 text-sm text-red-600">
            {productsState.error}
          </p>
        )}
      </div>

      <div className="sticky top-0 bg-white z-30 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="no-scrollbar flex overflow-x-auto py-3 sm:py-4">
            <div className="flex space-x-4 sm:space-x-8 flex-nowrap">
              {categoryTabs.map(({ name, slug }) => {
                const isActive = activeCategory === slug;
                return (
                  <button
                    key={slug}
                    onClick={() => handleCategoryChange(slug)}
                    className={`whitespace-nowrap text-xs sm:text-sm font-medium uppercase tracking-wider pb-2 transition-all flex-shrink-0 ${
                      isActive ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="lg:hidden sticky top-[53px] bg-white z-20 -mx-4 px-4 py-3 border-b shadow-sm mb-4 flex gap-3">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-md hover:border-black transition-colors relative"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="flex-1 relative">
            <button
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-md hover:border-black transition-colors"
            >
              Sort
              {isSortOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isSortOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border shadow-lg z-40 rounded-md overflow-hidden">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition-colors ${
                      sortBy === option.value ? 'bg-gray-50 font-semibold' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-40 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold uppercase tracking-wider">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-gray-500 hover:text-black"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider">Price</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={Math.floor(priceBounds.min)}
                    max={Math.max(Math.ceil(priceBounds.max), Math.floor(priceBounds.min) + 1)}
                    value={Math.min(priceRange[1], Math.max(Math.ceil(priceBounds.max), Math.floor(priceBounds.min) + 1))}
                    onChange={(event) => {
                      const newMax = Number(event.target.value);
                      setPriceRange([priceBounds.min, newMax]);
                    }}
                    className="w-full"
                    disabled={priceBounds.max === 0}
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatCurrency(priceBounds.min)}</span>
                    <span>{formatCurrency(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider">Availability</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInStockOnly}
                    onChange={(event) => setShowInStockOnly(event.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">In stock only</span>
                </label>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} found
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sort by: {SORT_OPTIONS.find((option) => option.value === sortBy)?.label}
                  {isSortOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isSortOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border shadow-lg z-40 rounded">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition-colors ${
                          sortBy === option.value ? 'bg-gray-50 font-semibold' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {productsState.loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="aspect-[3/4] bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center">
                <p className="text-lg font-semibold text-gray-700 mb-2">No products match your filters</p>
                <p className="text-sm text-gray-500 mb-6">
                  Try adjusting your filters or browse all products.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-900 transition"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {filteredProducts.map((product, index) => renderProductCard(product, index))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />

          <div className="relative ml-auto h-full w-full max-w-sm bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <h3 className="text-lg font-bold uppercase tracking-wider">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex h-[calc(100%-120px)] flex-col overflow-y-auto">
              <div className="flex-1 space-y-6 px-4 py-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Price</h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min={Math.floor(priceBounds.min)}
                      max={Math.max(Math.ceil(priceBounds.max), Math.floor(priceBounds.min) + 1)}
                      value={Math.min(priceRange[1], Math.max(Math.ceil(priceBounds.max), Math.floor(priceBounds.min) + 1))}
                      onChange={(event) => {
                        const newMax = Number(event.target.value);
                        setPriceRange([priceBounds.min, newMax]);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={priceBounds.max === 0}
                    />
                    <div className="flex justify-between text-sm font-medium text-gray-600">
                      <span>{formatCurrency(priceBounds.min)}</span>
                      <span>{formatCurrency(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Availability</h4>
                  <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors">
                    <input
                      type="checkbox"
                      checked={showInStockOnly}
                      onChange={(event) => setShowInStockOnly(event.target.checked)}
                      className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
                    />
                    <span className="text-sm font-medium">In stock only</span>
                  </label>
                </div>
              </div>

              <div className="border-t px-4 py-4 flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:border-black transition-all"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-900 transition-all"
                >
                  Show {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductsListingPage;