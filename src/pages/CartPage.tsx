import React from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Info, ArrowRight, ChevronRight } from 'lucide-react';
import { useCart } from '../CartContext'; 

const CartPage: React.FC = () => {
  // Use the cart context instead of local state
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  
  // Recommendation products
  const recommendedProducts = [
    {
      id: '3',
      name: "Warrior's Creed Oversized T-Shirt",
      price: 850.00,
      image: '/3.jpeg', 
      category: 'STREETWEAR',
    },
    {
      id: '4',
      name: 'Boss Vision Box Fit Tee',
      price: 900.00,
      image: '/4.jpeg',
      category: 'STREETWEAR',
    },
    {
      id: '5',
      name: 'Break The Rules Boxy Fit Tee',
      price: 900.00,
      image: '/5.jpeg', 
      category: 'STREETWEAR',
    }
  ];
  
  // Shipping calculation
  const freeShippingThreshold = 1100.00;
  const subtotal = getCartTotal();
  const shippingCost: number = 0; // Free shipping in this example
  const total = subtotal + shippingCost;
  const amountToFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Cart Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Cart</h1>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <p className="text-lg text-gray-500 mb-6">Your cart is currently empty</p>
          <Link 
            to="/products" 
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items Section */}
            <div className="flex-1">
              {/* Progress to free shipping */}
              {amountToFreeShipping > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={16} className="text-gray-500" />
                    <p className="text-sm font-medium">Spend ₹{amountToFreeShipping.toFixed(2)} more to reach free shipping</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full" 
                      style={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Cart Items List */}
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded">
                      <img 
                        src={item.image}
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/96';
                        }}
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{item.category}</p>
                          <h3 className="text-sm sm:text-base font-medium text-gray-900">{item.name}</h3>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Remove item"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-3">
                        Size: {item.size} / Color: {item.color}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 text-gray-500 hover:bg-gray-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-1 font-medium text-gray-800">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-gray-500 hover:bg-gray-100"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        {/* Price */}
                        <div className="font-semibold">₹{item.price.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Continue Shopping Link */}
              <div className="mb-8">
                <Link to="/products" className="text-gray-600 hover:text-black flex items-center gap-1">
                  <ArrowRight size={16} className="transform rotate-180" />
                  <span className="text-sm font-medium">Continue shopping</span>
                </Link>
              </div>

              {/* You may also like section */}
              <div className="border-t border-gray-200 pt-8 pb-6">
                <h2 className="text-lg font-bold mb-6">You May Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendedProducts.map(product => (
                    <div key={product.id} className="border border-gray-200 rounded-md overflow-hidden group">
                      <div className="aspect-square bg-gray-100">
                        <img 
                          src={product.image}
                          alt={product.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/300';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category}</p>
                        <h3 className="text-sm font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">₹{product.price.toFixed(2)}</span>
                          <Link 
                            to={`/products/${product.id}`}
                            className="inline-flex items-center text-xs font-medium text-gray-600 hover:text-black"
                          >
                            <span>CHOOSE OPTIONS</span>
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="w-full lg:w-96 lg:flex-shrink-0">
              <div className="border border-gray-200 rounded-md p-6 bg-gray-50">
                <h2 className="text-lg font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    {shippingCost === 0 ? (
                      <span className="font-medium text-green-600">Free</span>
                    ) : (
                      <span className="font-medium">₹{shippingCost.toFixed(2)}</span>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Including tax</p>
                  </div>
                </div>
                
                {/* Discount Code */}
                <div className="mb-6">
                  <div className="flex gap-2 mb-6">
                    <input 
                      type="text" 
                      placeholder="Discount code"
                      className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300 transition">
                      Apply
                    </button>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <Link 
                  to="/checkout" 
                  className="block w-full bg-black text-white text-center py-3 rounded-md font-medium hover:bg-gray-800 transition mb-4"
                >
                  CHECK OUT
                </Link>
                
                {/* Payment Icons */}
                <div className="flex justify-center gap-2 mb-4">
                  <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">VISA</span>
                  </div>
                  <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">MC</span>
                  </div>
                  <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">AMEX</span>
                  </div>
                </div>
                
                {/* Shipping Note */}
                <p className="text-xs text-gray-500 text-center">
                  Shipping calculated at checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;