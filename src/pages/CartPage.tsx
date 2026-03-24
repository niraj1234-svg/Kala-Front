import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Info, ArrowRight } from 'lucide-react';
import { appralStore, useAppralStore } from '../store/appralStore';
import { useAuthStore } from '../store/authStore';

const FALLBACK_IMAGE = '/placeholder-product.png';

const resolveImageUrl = (source?: string | null): string => {
  if (!source) {
    return FALLBACK_IMAGE;
  }
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return source;
  }
  if (source.startsWith('/')) {
    return source;
  }
  return `/${source.replace(/^\/+/, '')}`;
};

const formatCurrency = (value: number | string | null | undefined): string => {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value ?? '0');
  if (!Number.isFinite(numeric)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
  }).format(numeric);
};

const describeVariant = (variant?: { size: string | null; color_name: string | null; sku: string }): string | null => {
  if (!variant) {
    return null;
  }
  const parts = [variant.size, variant.color_name].filter(Boolean) as string[];
  return (parts.length > 0 ? parts.join(' • ') : variant.sku) ?? null;
};

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const authState = useAuthStore((state) => state);
  const cartState = useAppralStore((state) => state.cart);
  const [updatingLineId, setUpdatingLineId] = useState<number | null>(null);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      return;
    }
    if (!cartState.loading && !cartState.data) {
      appralStore.fetchCart().catch((error) => {
        console.error('Failed to load cart', error);
      });
    }
  }, [authState.isAuthenticated, cartState.data, cartState.loading]);

  const cart = cartState.data;
  const cartItems = cart?.items ?? [];

  const subtotal = useMemo(() => {
    if (!cart) {
      return 0;
    }
    return Number.parseFloat(cart.subtotal ?? '0');
  }, [cart]);

  const freeShippingThreshold = 1100;
  const amountToFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  const handleUpdateQuantity = async (itemId: number, nextQuantity: number) => {
    if (nextQuantity < 1) {
      return;
    }
    setUpdatingLineId(itemId);
    try {
      await appralStore.updateCartItem(itemId, { quantity: nextQuantity });
    } catch (error) {
      console.error('Failed to update cart item', error);
      alert('Unable to update quantity right now.');
    } finally {
      setUpdatingLineId(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingLineId(itemId);
    try {
      await appralStore.removeCartItem(itemId);
    } catch (error) {
      console.error('Failed to remove cart item', error);
      alert('Unable to remove this item right now.');
    } finally {
      setUpdatingLineId(null);
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 sm:pt-36 pb-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Access your cart</h1>
          <p className="text-gray-600">Sign in to view the items you’ve added to your cart.</p>
          <button
            onClick={() => navigate('/login', { state: { from: '/cart' } })}
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (cartState.loading && !cart) {
    return (
      <div className="min-h-screen pt-32 sm:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 sm:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Cart</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <p className="text-lg text-gray-500 mb-6">Your cart is currently empty</p>
          <Link
            to="/products"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 sm:pt-36 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Cart</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {amountToFreeShipping > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-gray-500" />
                  <p className="text-sm font-medium">
                    Spend {formatCurrency(amountToFreeShipping)} more to reach free shipping
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-md divide-y divide-gray-200 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded">
                    <img
                      src={resolveImageUrl(item.product.primary_image?.image_url)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(event) => {
                        (event.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{item.product.category}</p>
                        <h3 className="text-sm sm:text-base font-medium text-gray-900">{item.product.name}</h3>
                        {item.variant && (
                          <p className="text-xs text-gray-500 mt-1">
                            {describeVariant(item.variant)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Remove item"
                        disabled={updatingLineId === item.id}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1 || updatingLineId === item.id}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-1 font-medium text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Increase quantity"
                          disabled={updatingLineId === item.id}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="font-semibold">{formatCurrency(item.line_total)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <Link to="/products" className="text-gray-600 hover:text-black flex items-center gap-1">
                <ArrowRight size={16} className="transform rotate-180" />
                <span className="text-sm font-medium">Continue shopping</span>
              </Link>
            </div>
          </div>

          <aside className="w-full lg:w-96 lg:flex-shrink-0">
            <div className="border border-gray-200 rounded-md p-6 bg-gray-50">
              <h2 className="text-lg font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium">{cart.item_count}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(cart.subtotal)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Shipping and taxes calculated at checkout</p>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-black text-white text-center py-3 rounded-md font-medium hover:bg-gray-800 transition mb-4"
              >
                CHECK OUT
              </Link>

              <div className="flex justify-center gap-2 mb-4">
                {['VISA', 'Mastercard', 'AMEX'].map((label) => (
                  <div key={label} className="w-12 h-7 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
                    {label}
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 text-center">
                Need help? Contact support for assistance with your order.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;