import { useState } from 'react';
import { Heart, Share2, ChevronLeft, ChevronRight, Star, Truck, RefreshCw, Shield, ChevronDown, ChevronUp } from 'lucide-react';

const ProductDetailPage = () => {
  // Product data
  const product = {
    id: 1,
    name: 'Premium Cotton Hoodie',
    price: 65,
    originalPrice: 85,
    rating: 4.5,
    reviewCount: 128,
    badge: 'BESTSELLER',
    sku: 'HD-001-BLK',
    description: 'Elevate your casual wardrobe with our Premium Cotton Hoodie. Crafted from 100% organic cotton, this hoodie offers unparalleled comfort and style. Features a relaxed fit, adjustable drawstring hood, and kangaroo pocket.',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZlMNdCWIVx0LEJfA_MKzgflK2QKpzJq5jwQ&s',
      'https://images.unsplash.com/photo-1622445275576-721325763afe?q=80&w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', hex: '#000000', available: true },
      { name: 'White', hex: '#FFFFFF', available: true },
      { name: 'Gray', hex: '#808080', available: true },
      { name: 'Navy', hex: '#000080', available: false }
    ],
    inStock: true,
    stockCount: 12,
    details: {
      materials: '100% Organic Cotton',
      fit: 'Relaxed Fit',
      weight: '400 GSM',
      care: 'Machine wash cold, tumble dry low',
      madeIn: 'Portugal'
    },
    features: [
      'Premium organic cotton fabric',
      'Adjustable drawstring hood',
      'Kangaroo front pocket',
      'Ribbed cuffs and hem',
      'Reinforced seams for durability'
    ],
    modelInfo: 'Model is 6\'2" (188cm) and wearing size M'
  };

  // Reviews data
  const reviews = [
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      date: '2 weeks ago',
      verified: true,
      comment: 'Amazing quality! The fabric is so soft and the fit is perfect. Highly recommend.',
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200']
    },
    {
      id: 2,
      name: 'James K.',
      rating: 4,
      date: '1 month ago',
      verified: true,
      comment: 'Great hoodie, very comfortable. Runs slightly large, so consider sizing down.',
      images: []
    },
    {
      id: 3,
      name: 'Emma L.',
      rating: 5,
      date: '1 month ago',
      verified: true,
      comment: 'Love the quality and the fit. Perfect for everyday wear!',
      images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=200']
    }
  ];

  // Recommended products
  const recommendations = [
    {
      id: 2,
      name: 'Classic White Tee',
      price: 29,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400'
    },
    {
      id: 3,
      name: 'Comfort Sweatpants',
      price: 45,
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=400'
    },
    {
      id: 4,
      name: 'Crew Neck Sweatshirt',
      price: 55,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400'
    },
    {
      id: 5,
      name: 'Urban Jacket',
      price: 85,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400'
    }
  ];

  // State management
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  type SectionKey = 'details' | 'shipping' | 'returns';
 const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    details: true,
    shipping: false,
    returns: false
  });

 const toggleSection = (section: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    alert(`Added to cart: ${product.name} - Size ${selectedSize} - Color ${selectedColor.name}`);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
        <div className="text-sm text-gray-500">
          <a href="/" className="hover:text-black">Home</a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-black">Products</a>
          <span className="mx-2">/</span>
          <a href="/products?category=Hoodies" className="hover:text-black">Hoodies</a>
          <span className="mx-2">/</span>
          <span className="text-black">{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left - Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden group">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  {product.badge}
                </div>
              )}

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded">
                {selectedImage + 1} / {product.images.length}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square bg-gray-100 overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-black' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="space-y-6">
            
            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-black text-black'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-2">{product.rating}</span>
                </div>
                <a href="#reviews" className="text-sm text-gray-600 hover:text-black underline">
                  ({product.reviewCount} reviews)
                </a>
              </div>
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">£{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">£{product.originalPrice}</span>
                  <span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-1">
                    SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Color Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Color: <span className="font-normal">{selectedColor.name}</span>
                </h3>
              </div>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => color.available && setSelectedColor(color)}
                    disabled={!color.available}
                    className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                      selectedColor.name === color.name ? 'border-black scale-110' : 'border-gray-300'
                    } ${!color.available ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-500'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {!color.available && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-gray-400 rotate-45"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider">Select Size</h3>
                <button className="text-sm text-gray-600 hover:text-black underline">Size Guide</button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm font-medium transition-all border ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-900 border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{product.modelInfo}</p>
            </div>

            {/* Stock Status */}
            {product.inStock && product.stockCount < 20 && (
              <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                ⚡ Only {product.stockCount} left in stock - Order soon!
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-3 border-x border-gray-300 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white py-3 px-8 font-semibold uppercase tracking-wider hover:bg-gray-900 transition-colors"
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="border border-gray-300 p-3 hover:bg-gray-100 transition-colors"
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>

              <button className="w-full border border-black text-black py-3 font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition-colors">
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6" />
                <div>
                  <p className="text-xs font-semibold">Free Shipping</p>
                  <p className="text-xs text-gray-500">Orders over £50</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RefreshCw className="w-6 h-6" />
                <div>
                  <p className="text-xs font-semibold">Free Returns</p>
                  <p className="text-xs text-gray-500">Within 30 days</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="w-6 h-6" />
                <div>
                  <p className="text-xs font-semibold">Secure Payment</p>
                  <p className="text-xs text-gray-500">SSL Encrypted</p>
                </div>
              </div>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-2 pt-4">
              {/* Details */}
              <div className="border-t border-gray-200">
                <button
                  onClick={() => toggleSection('details')}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="font-semibold uppercase tracking-wider text-sm">Product Details</span>
                  {expandedSections.details ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.details && (
                  <div className="pb-4 space-y-3">
                    <ul className="space-y-2 text-sm text-gray-700">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-black mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="grid grid-cols-2 gap-3 pt-3 text-sm">
                      <div>
                        <p className="text-gray-500">Material</p>
                        <p className="font-medium">{product.details.materials}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fit</p>
                        <p className="font-medium">{product.details.fit}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Weight</p>
                        <p className="font-medium">{product.details.weight}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Made In</p>
                        <p className="font-medium">{product.details.madeIn}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-gray-500 text-sm">Care Instructions</p>
                      <p className="text-sm">{product.details.care}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div className="border-t border-gray-200">
                <button
                  onClick={() => toggleSection('shipping')}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="font-semibold uppercase tracking-wider text-sm">Shipping & Delivery</span>
                  {expandedSections.shipping ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.shipping && (
                  <div className="pb-4 text-sm text-gray-700 space-y-2">
                    <p>• Free standard shipping on orders over £50</p>
                    <p>• Express shipping available for £9.99</p>
                    <p>• Standard delivery: 3-5 business days</p>
                    <p>• Express delivery: 1-2 business days</p>
                  </div>
                )}
              </div>

              {/* Returns */}
              <div className="border-t border-b border-gray-200">
                <button
                  onClick={() => toggleSection('returns')}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="font-semibold uppercase tracking-wider text-sm">Returns & Exchanges</span>
                  {expandedSections.returns ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.returns && (
                  <div className="pb-4 text-sm text-gray-700 space-y-2">
                    <p>• Free returns within 30 days of purchase</p>
                    <p>• Items must be unworn with tags attached</p>
                    <p>• Refunds processed within 5-7 business days</p>
                    <p>• Free exchanges for different sizes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Share */}
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
              <Share2 className="w-4 h-4" />
              Share this product
            </button>
          </div>
        </div>

        {/* Complete The Look */}
        <div className="mt-16 pt-16 border-t">
          <h2 className="text-2xl font-bold mb-8 uppercase tracking-wider">Complete The Look</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((item) => (
              <a key={item.id} href={`/products/${item.id}`} className="group">
                <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-sm font-medium mb-1 group-hover:text-gray-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm font-semibold">£{item.price}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="mt-16 pt-16 border-t">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-wider">Customer Reviews</h2>
            <button className="text-sm font-medium underline hover:no-underline">Write a Review</button>
          </div>

          {/* Rating Summary */}
          <div className="bg-gray-50 p-6 mb-8 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{product.rating}</div>
              <div className="flex items-center gap-1 justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-black text-black' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{product.reviewCount} reviews</p>
            </div>
            <div className="flex-1 space-y-2 w-full">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm w-8">{stars}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black"
                      style={{
                        width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 8 : stars === 2 ? 2 : 0}}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {stars === 5 ? 90 : stars === 4 ? 26 : stars === 3 ? 10 : stars === 2 ?2 : 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{review.name}</span>
                      {review.verified && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-black text-black' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                {review.images.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Customer photo"
                        className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="mt-8 w-full py-3 border border-gray-300 font-medium hover:border-black transition-colors">
            Load More Reviews
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;