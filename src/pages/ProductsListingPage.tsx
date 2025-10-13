import React, { useState} from 'react';
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
  const [isFilterOpen, setIsFilterOpen] = useState(true);
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
      image1: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600',
      image2: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600',
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
      image1: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600',
      image2: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600',
      inStock: true
    },
    {
      id: 3,
      name: 'Crew Neck Sweatshirt',
      price: 55,
      category: 'Sweatshirts',
      size: ['S', 'M', 'L'],
      color: 'Gray',
      image1: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600',
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
      image1: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600',
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
      image1: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600',
      image2: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600',
      inStock: true
    },
    {
      id: 6,
      name: 'Urban Jacket',
      price: 85,
      category: 'Jackets',
      size: ['M', 'L', 'XL'],
      color: 'Black',
      image1: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600',
      image2: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600',
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
      image1: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600',
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
      image1: 'https://images.unsplash.com/photo-1503341338985-95cf5cfe5802?q=80&w=600',
      image2: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600',
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

  return (
    <div className="min-h-screen bg-white pt-24">
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-sm text-gray-500">
          <a href="/" className="hover:text-black">Home</a>
          <span className="mx-2">/</span>
          <span className="text-black">Products</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">SHOP ALL</h1>
        <p className="text-gray-600">Showing {filteredProducts.length} products</p>
      </div>

      {/* Category Tabs - Sticky */}
      <div className="sticky top-20 bg-white z-30 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-8 py-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap text-sm font-medium uppercase tracking-wider pb-2 transition-all ${
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          
          {/* Left Sidebar - Filters */}
          <aside className={`${isFilterOpen ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden`}>
            <div className="sticky top-40 space-y-6">
              
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold uppercase tracking-wider">Filters</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="lg:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
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

          {/* Right - Products Grid */}
          <div className="flex-1">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {isFilterOpen ? 'Hide' : 'Show'} Filters
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sort By: {sortBy === 'featured' ? 'Featured' : sortBy === 'price-low' ? 'Price: Low' : sortBy === 'price-high' ? 'Price: High' : 'Name'}
                  {isSortOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isSortOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border shadow-lg z-40">
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

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  <div className="relative">
                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-3 left-3 z-20">
                        <span className={`text-xs font-bold px-3 py-1 uppercase tracking-wider ${
                          product.badge === 'SOLD OUT' ? 'bg-gray-900 text-white' : 'bg-white text-black'
                        }`}>
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* Images */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
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
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm font-semibold">£{product.price}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

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