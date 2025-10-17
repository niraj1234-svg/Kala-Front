import { useState } from 'react';
import { Heart, Share2, ChevronLeft, ChevronRight, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext'; 

const ProductDetailPage = () => {
  const navigate = useNavigate();
  // Use cart context
  const { addToCart } = useCart();
  
  // Product data
  const product = {
    id: '1', // Make sure this is a string to match CartItem interface
    name: 'Raiments Cream Gilet',
    price: 98,
    originalPrice: null,
    rating: 4.5,
    reviewCount: 128,
  
    sku: 'HD-001-BLK',
    description: 'The Heritage Gilet. Ready for all occasions.',
    longDescription: 'Introducing the Raiments Cream Gilet. Crafted from heavyweight premium fleece for exceptional warmth, this gilet features an authentic premium leather trim, equipped with durable YKK zips and hidden side pockets for secure storage. The adjustable waistline ensures a tailored fit. Finished with embroidered mallard logo.',
    images: [
      '/6.jpeg',
      '/7.jpeg',
      '/8.jpeg',
      '/9.jpeg',
      '/10.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Burgundy', hex: '#800020', available: true },
      { name: 'White', hex: '#FFFFFF', available: true },
      { name: 'Black', hex: '#000000', available: true },
      { name: 'Navy', hex: '#000080', available: false }
    ],
    inStock: true, // Changed to true to make it work
    stockCount: 12,
    details: {
      materials: 'Heavyweight Premium Fleece',
      trim: 'Authentic Leather Trim',
      features: 'Adjustable Drawstring Hood',
      pockets: 'Hidden Side Pockets',
      logo: 'Embroidered Mallard Logo'
    },
    features: [
      'Heavyweight Premium Fleece',
      'Authentic Leather Trim',
      'Durable YKK Zips',
      'Hidden Side Pockets',
      'Adjustable Waistline',
      'Embroidered Mallard Logo'
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
      images: ['/1.jpeg']
    },
    {
      id: 2,
      name: 'James K.',
      rating: 4,
      date: '1 month ago',
      verified: true,
      comment: 'Great hoodie, very comfortable. Runs slightly large, so consider sizing down.',
      images: []
    }
  ];
  
  // Recommended products
  const recommendations = [
    {
      id: '2',
      name: 'Classic White Tee',
      price: 29,
      image: '/2.jpeg'
    },
    {
      id: '3',
      name: 'Comfort Sweatpants',
      price: 45,
      image: '/3.jpeg'
    },
    {
      id: '4',
      name: 'Crew Neck Sweatshirt',
      price: 55,
      image: '/4.jpeg'
    },
    {
      id: '5',
      name: 'Urban Jacket',
      price: 85,
      image: '/5.jpeg'
    }
  ];

  // State management
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('small');
  type SectionKey = 'fit' | 'shipping';
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    fit: true,
    shipping: false
  });

  const toggleSection = (section: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Updated handleAddToCart to use context
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    if (!product.inStock) {
      alert('This product is currently out of stock');
      return;
    }

    // Create cart item from product data
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor.name,
      image: product.images[0], // Use first image
      quantity: quantity,
      category: 'Clothing' // Add a default category
    };

    // Add to cart using context
    addToCart(cartItem);

    // Show success message or redirect
    const confirmResult = window.confirm(`${product.name} added to cart! View cart now?`);
    if (confirmResult) {
      // Redirect to cart page
      navigate('/cart');
    }
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
          <div className="space-y-5">
            
            {/* Title */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-base text-gray-600 mb-3">{product.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-5 border-b border-gray-200">
              <span className="text-2xl font-bold text-gray-900">£{product.price}.00</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">£{product.originalPrice}</span>
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                    SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="pb-5 border-b border-gray-200">
              {!product.inStock ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-sm font-medium">Item is out of stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">In Stock</span>
                </div>
              )}
            </div>

            {/* Color Selector */}
            <div className="pb-5 border-b border-gray-200">
              <h3 className="text-sm font-semibold mb-3">Color</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => color.available && setSelectedColor(color)}
                    disabled={!color.available}
                    className={`relative w-10 h-10 rounded border transition-all ${
                      selectedColor.name === color.name ? 'ring-2 ring-black ring-offset-2' : 'border-gray-300'
                    } ${!color.available ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-500'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {!color.available && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="pb-5 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">
                  Size <a href="#" className="text-blue-600 hover:underline text-xs font-normal ml-2">Size chart</a>
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 text-sm font-medium transition-all border rounded ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-900 border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="pb-5 border-b border-gray-200">
              <h3 className="text-sm font-semibold mb-3">Quantity</h3>
              <div className="flex items-center border border-gray-300 rounded-md w-32 overflow-hidden">
                <button 
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                >
                  -
                </button>
                <input 
                  type="text" 
                  value={quantity}
                  readOnly
                  className="w-12 py-2 text-center text-gray-700 bg-white border-x border-gray-300 focus:outline-none"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full py-4 px-8 font-semibold text-base rounded transition-colors ${
                  product.inStock
                    ? 'bg-gray-800 text-white hover:bg-black'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.inStock ? 'ADD TO CART' : 'SOLD OUT'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="flex-1 border border-gray-300 py-3 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="text-sm font-medium">Wishlist</span>
                </button>
                
                <button className="border border-gray-300 p-3 rounded hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Product Information Tabs */}
            <div className="space-y-0 pt-2">
              {/* Fit Tab */}
              <div className="border-t border-gray-200">
                <button
                  onClick={() => toggleSection('fit')}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="font-semibold text-sm">Fit</span>
                  {expandedSections.fit ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.fit && (
                  <div className="pb-4 space-y-3">
                    <div className="flex gap-8 text-sm">
                      <button 
                        onClick={() => setActiveTab('small')}
                        className={`pb-2 ${activeTab === 'small' ? 'border-b-2 border-black font-semibold' : 'text-gray-500 hover:text-black'}`}
                      >
                        Small
                      </button>
                      <button 
                        onClick={() => setActiveTab('true')}
                        className={`pb-2 ${activeTab === 'true' ? 'border-b-2 border-black font-semibold' : 'text-gray-500 hover:text-black'}`}
                      >
                        True to size
                      </button>
                      <button 
                        onClick={() => setActiveTab('large')}
                        className={`pb-2 ${activeTab === 'large' ? 'border-b-2 border-black font-semibold' : 'text-gray-500 hover:text-black'}`}
                      >
                        Large
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {product.longDescription}
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-black mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Shipping & Returns Tab */}
              <div className="border-t border-b border-gray-200">
                <button
                  onClick={() => toggleSection('shipping')}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="font-semibold text-sm">Shipping & Returns</span>
                  {expandedSections.shipping ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.shipping && (
                  <div className="pb-4 text-sm text-gray-700 space-y-2">
                    <p>• Free standard shipping on orders over £50</p>
                    <p>• Express shipping available for £9.99</p>
                    <p>• Standard delivery: 3-5 business days</p>
                    <p>• Free returns within 30 days of purchase</p>
                    <p>• Items must be unworn with tags attached</p>
                    <p>• Refunds processed within 5-7 business days</p>
                  </div>
                )}
              </div>
            </div>
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
                        width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 8 : stars === 2 ? 2 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {stars === 5 ? 90 : stars === 4 ? 26 : stars === 3 ? 10 : stars === 2 ? 2 : 0}
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