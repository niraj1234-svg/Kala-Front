import React, { useState } from 'react';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  size: string[];
  color: string;
  image1: string;
  image2: string;
  badge?: string;
  inStock: boolean;
}

const ProductsListingPage: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // All products data
  const allProducts: Product[] = [
    {
      id: 1,
      name: 'Classic White Tee',
      price: 29,
      category: 'T-Shirts',
      size: ['S', 'M', 'L', 'XL'],
      color: 'White',
      image1: '3.jpeg',
      image2: '4.jpeg',
      badge: 'NEW',
      inStock: true
    },
    {
      id: 2,
      name: 'Premium Hoodie',
      price: 65,
      category: 'Hoodies',
      size: ['M', 'L', 'XL', 'XXL'],
      color: 'Black',
     image1: '8.jpeg',
      image2: '9.jpeg',
      inStock: true
    },
    {
      id: 3,
      name: 'Crew Neck Sweatshirt',
      price: 55,
      category: 'Sweatshirts',
      size: ['S', 'M', 'L'],
      color: 'Gray',
     image1: '10.jpeg',
      image2: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=600',
      badge: 'SOLD OUT',
      inStock: false
    },
    {
      id: 4,
      name: 'Comfort Sweatpants',
      price: 45,
      category: 'Pants',
      size: ['M', 'L', 'XL'],
      color: 'Blue',
       image1: '12.jpeg',
      image2: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600',
      inStock: true
    },
    {
      id: 5,
      name: 'Summer Shorts',
      price: 35,
      category: 'Shorts',
      size: ['S', 'M', 'L', 'XL'],
      color: 'Beige',
       image1: '8.jpeg',
      image2: '6.jpeg',
      inStock: true
    },
    {
      id: 6,
      name: 'Urban Jacket',
      price: 85,
      category: 'Jackets',
      size: ['M', 'L', 'XL'],
      color: 'Black',
      image1: '10.jpeg',
      image2: '11.jpeg',
      badge: 'NEW',
      inStock: true
    },
    {
      id: 7,
      name: 'Slim Fit Jeans',
      price: 75,
      category: 'Jeans',
      size: ['S', 'M', 'L', 'XL'],
      color: 'Blue',
       image1: '12.jpeg',
      image2: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?q=80&w=600',
      inStock: true
    },
    {
      id: 8,
      name: 'Graphic Print Tee',
      price: 32,
      category: 'T-Shirts',
      size: ['S', 'M', 'L'],
      color: 'White',
       image1: '1.jpeg',
      image2: '3.jpeg',
      inStock: true
    }
  ];

  const categories = ['All', 'T-Shirts', 'Hoodies', 'Sweatshirts', 'Jackets', 'Pants', 'Shorts', 'Jeans'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Gray', 'Blue', 'Beige'];

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = allProducts;

    // Category filter
    if (activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    // Price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => p.size.some(s => selectedSizes.includes(s)));
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => selectedColors.includes(p.color));
    }

    // Stock filter
    if (showInStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const clearFilters = () => {
    setPriceRange([0, 200]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setShowInStockOnly(false);
  };

  const activeFiltersCount = 
    (priceRange[1] !== 200 ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (showInStockOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
      
      {/* Breadcrumb - Hidden on mobile, visible on tablet+ */}
      <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-sm text-gray-500">
          <a href="/" className="hover:text-black">Home</a>
          <span className="mx-2">/</span>
          <span className="text-black">Products</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b bg-white">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">SHOP ALL</h1>
        <p className="text-sm sm:text-base text-gray-600">Showing {filteredProducts.length} products</p>
      </div>

      {/* Category Tabs - Sticky - Horizontal Scroll on Mobile */}
      <div className="sticky top-2 sm:top-2 bg-white z-30 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-4 sm:space-x-8 py-3 sm:py-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap text-xs sm:text-sm font-medium uppercase tracking-wider pb-2 transition-all ${
                  activeCategory === cat
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Mobile Filter/Sort Bar - Sticky */}
        <div className="lg:hidden sticky top-32 sm:top-36 bg-white z-20 -mx-4 px-4 py-3 border-b shadow-sm mb-4 flex gap-2">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 hover:border-black transition-colors relative"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 hover:border-black transition-colors"
          >
            Sort
            {isSortOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Sort Dropdown */}
        {isSortOpen && (
          <div className="lg:hidden fixed inset-x-4 top-48 bg-white border shadow-lg z-30 rounded-lg overflow-hidden">
            {[
              { value: 'featured', label: 'Featured' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
              { value: 'name', label: 'Name: A-Z' }
            ].map((option) => (
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

        <div className="flex gap-8">
          
          {/* Desktop Sidebar - Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-40 space-y-6">
              
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold uppercase tracking-wider">Filters</h3>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider">Price</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>£{priceRange[0]}</span>
                    <span>£{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Size Filter */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSizes(prev =>
                          prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                        );
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-all ${
                        selectedSizes.includes(size)
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider">Color</h4>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColors(prev =>
                          prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                        );
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColors.includes(color) ? 'border-black scale-110' : 'border-gray-300'
                      }`}
                      style={{
                        backgroundColor: color.toLowerCase() === 'beige' ? '#F5F5DC' : color.toLowerCase()
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider">Availability</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInStockOnly}
                    onChange={(e) => setShowInStockOnly(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full py-2 text-sm font-medium text-gray-700 hover:text-black border border-gray-300 hover:border-black transition-all"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            
            {/* Desktop Top Bar */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {filteredProducts.length} products found
              </div>

              {/* Desktop Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sort By: {sortBy === 'featured' ? 'Featured' : sortBy === 'price-low' ? 'Price: Low' : sortBy === 'price-high' ? 'Price: High' : 'Name'}
                  {isSortOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isSortOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border shadow-lg z-40 rounded">
                    {[
                      { value: 'featured', label: 'Featured' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                      { value: 'name', label: 'Name: A-Z' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid - Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredProducts.map((product, index) => (
                <a
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block"
                  onMouseEnter={() => setActiveProduct(product.id)}
                  onMouseLeave={() => setActiveProduct(null)}
                  style={{
                    animation: 'fadeInUp 0.6s ease-out',
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-2 left-2 z-20">
                        <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wider ${
                          product.badge === 'SOLD OUT' ? 'bg-gray-900 text-white' : 'bg-white text-black'
                        }`}>
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* Images */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      <img
                        src={product.image1}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                          activeProduct === product.id ? 'opacity-0' : 'opacity-100'
                        }`}
                      />
                      <img
                        src={product.image2}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                          activeProduct === product.id ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-4 space-y-1">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm sm:text-base font-semibold">£{product.price}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar/Modal */}
      {isFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold uppercase tracking-wider">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-4 space-y-6">
              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider">Price</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full h-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>£{priceRange[0]}</span>
                    <span>£{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Size Filter */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSizes(prev =>
                          prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                        );
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-all ${
                        selectedSizes.includes(size)
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider">Color</h4>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColors(prev =>
                          prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                        );
                      }}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColors.includes(color) ? 'border-black scale-110' : 'border-gray-300'
                      }`}
                      style={{
                        backgroundColor: color.toLowerCase() === 'beige' ? '#F5F5DC' : color.toLowerCase()
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider">Availability</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInStockOnly}
                    onChange={(e) => setShowInStockOnly(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 text-sm font-medium text-gray-700 border border-gray-300 hover:border-black transition-all"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 text-sm font-medium bg-black text-white hover:bg-gray-900 transition-all"
              >
                Show {filteredProducts.length} Products
              </button>
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
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ProductsListingPage;