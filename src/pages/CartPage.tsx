import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { KALA_CONFIG } from '../constants/config';
import { getProductBySlugOrId } from '../constants/products';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();
  const { addToWishlist } = useWishlist();

  const subtotal = getCartTotal();
  const count = getCartCount();
  const shippingFee = subtotal >= KALA_CONFIG.shipping.freeShippingThreshold ? 0 : (subtotal > 0 ? KALA_CONFIG.shipping.standardShippingFee : 0);
  const total = subtotal + shippingFee;

  const handleMoveToWishlist = (item: any) => {
    const prod = getProductBySlugOrId(item.id);
    if (prod) {
      addToWishlist(prod);
    } else {
      addToWishlist({
        id: item.id,
        name: item.name,
        slug: item.slug || item.id,
        category: item.category || 'Apparel',
        subCategory: item.subCategory || 'T-Shirts',
        description: '',
        price: item.price,
        image: item.image,
        inStock: true,
        isSoldOut: false,
        isFeatured: false,
        isCustomizable: true,
        createdAt: new Date().toISOString()
      });
    }
    removeFromCart(item.cartItemId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="font-serif text-3xl sm:text-5xl font-black uppercase text-foreground">
              Shopping Cart ({count})
            </h1>
            <p className="text-xs text-mid mt-1">
              Review your customized apparel and merchandise before proceeding to checkout.
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-700 underline self-start sm:self-auto font-mono"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State (Rule 49) */
          <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-mid">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-foreground">
              Your cart is waiting for something KALA.
            </h2>
            <p className="text-xs sm:text-sm text-mid leading-relaxed">
              Explore our custom drop-shoulder streetwear, gaming jerseys, or gym wear collections.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-transform hover:-translate-y-0.5"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-card border border-border rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xs transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-contain bg-[#faf8f5] dark:bg-[#181614] p-2 border border-border shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-mid block">
                        {item.category || 'Apparel'}
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">
                        <Link to={`/product/${item.id}`} className="hover:text-kala-emerald transition-colors">
                          {item.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-mid font-mono">
                        <span>Size: <strong className="text-foreground">{item.size}</strong></span>
                        <span>&bull;</span>
                        <span>Color: <strong className="text-foreground">{item.color}</strong></span>
                      </div>
                      <p className="font-bold text-kala-emerald text-sm sm:text-base pt-0.5">
                        ₹{item.price}
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-border rounded-xl bg-background shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-3 py-1.5 text-xs text-mid hover:text-foreground"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1.5 text-xs font-mono font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="px-3 py-1.5 text-xs text-mid hover:text-foreground"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-base text-foreground min-w-[65px] text-right">
                      ₹{item.price * item.quantity}
                    </span>

                    {/* Move to Wishlist */}
                    <button
                      onClick={() => handleMoveToWishlist(item)}
                      className="p-2 text-mid hover:text-kala-emerald hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                      title="Move to Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="p-2 text-mid hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28 shadow-sm">
              <h2 className="font-serif text-xl font-bold uppercase text-foreground">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs text-mid border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-foreground text-sm">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated Delivery:</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase font-mono">FREE (Above ₹999)</span>
                  ) : (
                    <span className="font-mono font-bold text-foreground">₹{shippingFee}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Quality Assurance:</span>
                  <span className="text-emerald-600 font-bold uppercase">Included Free</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between font-bold text-foreground">
                <span className="font-serif text-lg uppercase">Total:</span>
                <span className="font-serif text-2xl text-kala-emerald font-black">₹{total}</span>
              </div>

              {/* Native Checkout CTA */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/shop"
                className="block text-center text-xs text-mid hover:text-foreground font-semibold uppercase tracking-wider"
              >
                &larr; Continue Shopping
              </Link>

              {/* Assurance note */}
              <div className="bg-background border border-border rounded-xl p-3 text-[11px] text-mid leading-relaxed flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-kala-emerald shrink-0" />
                <span>Pan-India Doorstep Dispatch with Free Return on Defective Prints</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;