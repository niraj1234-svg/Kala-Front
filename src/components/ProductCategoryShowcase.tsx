import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  image1: string;
  image2: string;
  badge?: string;
  link: string;
}

const ProductCategoryShowcase: React.FC = () => {
  const [activeProduct, setActiveProduct] = useState<number | null>(null);

  const products: Product[] = [
    {
      id: 1,
      name: 'Classic White Tee',
      price: '£29.00',
      category: 'T-Shirts',
      image1: '3.jpeg',
      image2: '4.jpeg',
      badge: 'NEW',
      link: '/products/classic-white-tee'
    },
    {
      id: 2,
      name: 'Premium Hoodie',
      price: '£65.00',
      category: 'Hoodies',
      image1: '8.jpeg',
      image2: '9.jpeg',
      link: '/products/premium-hoodie'
    },
    {
      id: 3,
      name: 'Crew Neck Sweatshirt',
      price: '£55.00',
      category: 'Sweatshirts',
      image1: '10.jpeg',
      image2: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=600',
      badge: 'SOLD OUT',
      link: '/products/crew-neck-sweatshirt'
    },
    {
      id: 4,
      name: 'Comfort Sweatpants',
      price: '£45.00',
      category: 'Sweatpants',
      image1: '12.jpeg',
      image2: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600',
      link: '/products/comfort-sweatpants'
    },
    {
      id: 5,
      name: 'Summer Shorts',
      price: '£35.00',
      category: 'Shorts',
      image1: '8.jpeg',
      image2: '6.jpeg',
      link: '/products/summer-shorts'
    },
    {
      id: 6,
      name: 'Urban Jacket',
      price: '£85.00',
      category: 'Jackets',
      image1: '10.jpeg',
      image2: '11.jpeg',
      badge: 'NEW',
      link: '/products/urban-jacket'
    },
    {
      id: 7,
      name: 'Slim Fit Jeans',
      price: '£75.00',
      category: 'Jeans',
      image1: '12.jpeg',
      image2: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?q=80&w=600',
      link: '/products/slim-fit-jeans'
    },
    {
      id: 8,
      name: 'Graphic Print Tee',
      price: '£32.00',
      category: 'T-Shirts',
      image1: '1.jpeg',
      image2: '3.jpeg',
      link: '/products/graphic-print-tee'
    }
  ];

  const categories = ['All', 'T-Shirts', 'Hoodies', 'Sweatshirts', 'Sweatpants', 'Shorts', 'Jackets', 'Jeans'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Shop All
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our latest collection of premium clothing and accessories
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, index) => (
            <a
              key={product.id}
              href={product.link}
              className="group block"
              onMouseEnter={() => setActiveProduct(product.id)}
              onMouseLeave={() => setActiveProduct(null)}
              onTouchStart={() => setActiveProduct(product.id)}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Product Card */}
              <div className="relative overflow-hidden bg-white">
                
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3 z-20">
                    <span className={`text-xs font-bold px-3 py-1 uppercase tracking-wider ${
                      product.badge === 'SOLD OUT' 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-black'
                    }`}>
                      {product.badge}
                    </span>
                  </div>
                )}

                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  
                  {/* First Image */}
                  <img
                    src={product.image1}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      activeProduct === product.id ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  
                  {/* Second Image (Hover/Touch) */}
                  <img
                    src={product.image2}
                    alt={`${product.name} - Back view`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      activeProduct === product.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Hover Overlay */}
                  <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${
                    activeProduct === product.id ? 'opacity-100' : 'opacity-0'
                  }`}></div>

                  {/* Quick View Button - Desktop Only */}
                  <div className={`hidden sm:flex absolute inset-x-0 bottom-4 justify-center transition-all duration-300 ${
                    activeProduct === product.id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}>
                    <button className="px-6 py-2 bg-white text-black text-sm font-semibold uppercase tracking-wide hover:bg-gray-100 transition-colors flex items-center gap-2">
                      Quick View
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <span className="text-sm sm:text-base font-semibold text-gray-900 whitespace-nowrap">
                      {product.price}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
                    {product.category}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 sm:mt-16">
          <a href="/products">
            <button className="group px-8 py-4 bg-black text-white font-semibold text-sm uppercase tracking-wider hover:bg-gray-900 transition-all duration-300 hover:shadow-xl flex items-center gap-2 mx-auto">
              View All Products
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </a>
        </div>
      </div>

      {/* Touch Instructions for Mobile - Only show on first visit */}
      <div className="fixed bottom-4 right-4 sm:hidden bg-black text-white text-xs px-4 py-2 rounded-full animate-bounce pointer-events-none opacity-60">
        Tap to view back
      </div>
    </section>
  );
};

export default ProductCategoryShowcase;