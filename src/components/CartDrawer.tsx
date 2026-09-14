import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';

export const CartDrawer: React.FC = () => {
  const { isDrawerOpen, closeDrawer, lastAddedItem, getCartTotal, getCartCount, cartItems } = useCart();
  const navigate = useNavigate();

  const total = getCartTotal();
  const count = getCartCount();

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeDrawer();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs"
            onClick={closeDrawer}
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-md bg-card border-l border-border h-full shadow-2xl z-10 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-serif text-lg font-bold uppercase tracking-wide text-foreground">
                  Added to Your Cart
                </h3>
              </div>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-mid hover:text-foreground transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Recently Added Highlight */}
              {lastAddedItem && (
                <div className="bg-background border border-border rounded-2xl p-4 flex gap-4 shadow-2xs">
                  <img
                    src={lastAddedItem.image}
                    alt={lastAddedItem.name}
                    className="w-20 h-20 rounded-xl object-contain bg-[#faf8f5] dark:bg-[#181614] p-2 border border-border shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] font-mono uppercase text-mid block">
                      {lastAddedItem.category}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-foreground line-clamp-1">
                      {lastAddedItem.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs font-mono text-mid">
                      <span>Size: <strong className="text-foreground">{lastAddedItem.size}</strong></span>
                      <span>&bull;</span>
                      <span>Color: <strong className="text-foreground">{lastAddedItem.color}</strong></span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-mid">Qty: {lastAddedItem.quantity}</span>
                      <span className="font-bold text-kala-emerald text-sm">
                        ₹{lastAddedItem.price * lastAddedItem.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Cart Summary Preview */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-mid">
                  <span>Total Items in Cart:</span>
                  <span className="font-mono font-bold text-foreground">{count}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-foreground border-t border-border pt-2">
                  <span>Cart Subtotal:</span>
                  <span className="font-serif text-lg text-kala-emerald">₹{total}</span>
                </div>
                <p className="text-[11px] text-mid">
                  Taxes and doorstep shipping calculated at checkout. Free shipping on orders over ₹999.
                </p>
              </div>

              {/* Mini Cart Preview of other items */}
              {cartItems.length > 1 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-mid block">
                    Other items in your bag ({cartItems.length - 1}):
                  </span>
                  <div className="space-y-2">
                    {cartItems
                      .filter(it => it.cartItemId !== lastAddedItem?.cartItemId)
                      .slice(0, 3)
                      .map(it => (
                        <div key={it.cartItemId} className="flex items-center justify-between text-xs py-1 border-b border-border/50">
                          <span className="truncate max-w-[200px]">{it.name} ({it.size})</span>
                          <span className="font-mono font-bold">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-border bg-card space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-transform hover:-translate-y-0.5"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleViewCart}
                className="w-full py-3 bg-background hover:bg-black/5 dark:hover:bg-white/5 border border-border text-foreground rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Full Bag ({count})</span>
              </button>

              <button
                onClick={closeDrawer}
                className="w-full text-center text-xs text-mid hover:text-foreground py-1 font-semibold"
              >
                Continue Shopping &rarr;
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
