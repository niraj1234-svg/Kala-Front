import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { appralStore, useAppralStore } from '../store/appralStore';
import { useAuthStore } from '../store/authStore';
import OptimizedImage from '../components/hustle-hour/OptimizedImage';

const FALLBACK_IMAGE = '/placeholder-product.png';

const resolveImageUrl = (source?: string | null): string => {
  if (!source || source.includes('placeholder')) return FALLBACK_IMAGE;
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  return source.startsWith('/') ? source : `/${source}`;
};

const formatCurrency = (value: number | string | null | undefined): string => {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value ?? '0');
  if (!Number.isFinite(numeric)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
  }).format(numeric);
};

const describeVariant = (variant?: { size: string | null; color_name: string | null; sku: string }): string | null => {
  if (!variant) return null;
  const parts = [variant.size, variant.color_name].filter(Boolean) as string[];
  return (parts.length > 0 ? parts.join(' • ') : variant.sku) ?? null;
};

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const authState = useAuthStore((state) => state);
  const cartState = useAppralStore((state) => state.cart);
  const [updatingLineId, setUpdatingLineId] = useState<number | null>(null);

  useEffect(() => {
    if (!authState.isAuthenticated) return;
    if (!cartState.loading && !cartState.data) {
      appralStore.fetchCart().catch(e => console.error('Cart fetch failed', e));
    }
  }, [authState.isAuthenticated, cartState.data, cartState.loading]);

  const cart = cartState.data;
  const cartItems = cart?.items ?? [];
  const subtotal = useMemo(() => cart ? Number.parseFloat(cart.subtotal ?? '0') : 0, [cart]);
  const freeShippingThreshold = 1100;
  const amountToFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  const handleUpdateQuantity = async (itemId: number, nextQuantity: number) => {
    if (nextQuantity < 1) return;
    setUpdatingLineId(itemId);
    try {
      await appralStore.updateCartItem(itemId, { quantity: nextQuantity });
    } catch (e) {
    } finally {
      setUpdatingLineId(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingLineId(itemId);
    try {
      await appralStore.removeCartItem(itemId);
    } catch (e) {
    } finally {
      setUpdatingLineId(null);
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-sm">
          <div className="flex justify-center mb-8">
            <ShoppingBag className="w-12 h-12 text-accent/40" />
          </div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Access Restricted</h1>
          <p className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/40 leading-relaxed">
            Please authenticate to view your curated collection and proceed with the acquisition.
          </p>
          <button
            onClick={() => navigate('/login', { state: { from: '/cart' } })}
            className="w-full h-14 bg-foreground text-background font-body text-[10px] tracking-[0.4em] uppercase hover:bg-accent hover:text-foreground transition-all"
          >
            Authenticate Access
          </button>
        </div>
      </div>
    );
  }

  if (cartState.loading && !cart) {
    return (
      <div className="min-h-screen bg-background pt-32 p-6 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-[10px] tracking-[0.4em] uppercase text-foreground/40 text-center">Synchronizing Collection...</p>
      </div>
    );
  }

  if (!cart || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-32 p-6">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
          <h1 className="font-display text-7xl md:text-9xl uppercase tracking-tighter mb-20 drop-shadow-sm">Your Bag</h1>
          <div className="py-20 border-t border-foreground/5 text-center space-y-12">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-foreground/40">Your collection is currently void of artifacts.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 font-body text-[10px] tracking-[0.4em] uppercase text-accent hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Archive
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-24 lg:pt-32 relative overflow-x-hidden">
      {/* Grain Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 lg:mb-24">
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-7xl md:text-9xl uppercase tracking-tighter leading-none"
          >
            Your<br />Bag
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-end gap-2"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl text-accent">{cartItems.length}</span>
              <span className="font-body text-[9px] tracking-[0.3em] uppercase opacity-40">Artifacts Ready</span>
            </div>
            {amountToFreeShipping > 0 && (
              <p className="font-body text-[8px] tracking-[0.2em] uppercase text-accent/60">
                {formatCurrency(amountToFreeShipping)} more for global shipping
              </p>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-12">
            <div className="border-t border-foreground/5">
              {cartItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="py-10 border-b border-foreground/5 flex flex-col md:flex-row gap-8 lg:gap-12 relative group"
                >
                  <div className="w-32 aspect-[3/4] bg-foreground/5 overflow-hidden border border-foreground/5">
                    <OptimizedImage
                      src={resolveImageUrl(item.product.primary_image?.image_url)}
                      alt={item.product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <span className="font-body text-[8px] tracking-[0.4em] uppercase text-accent font-bold">Artifact-0{item.product.id}</span>
                        <h3 className="font-display text-2xl lg:text-3xl uppercase tracking-tight">{item.product.name}</h3>
                        {item.variant && (
                          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-foreground/40">
                            {describeVariant(item.variant)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-foreground/20 hover:text-accent transition-colors"
                        disabled={updatingLineId === item.id}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-8">
                      <div className="flex items-center gap-8 border-b border-foreground/5 pb-2 w-fit">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="text-foreground/30 hover:text-foreground transition-colors disabled:opacity-20"
                          disabled={item.quantity <= 1 || updatingLineId === item.id}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-display text-xl w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-foreground/30 hover:text-foreground transition-colors disabled:opacity-20"
                          disabled={updatingLineId === item.id}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="font-display text-3xl">{formatCurrency(item.line_total)}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-4 py-8 group"
            >
              <div className="w-8 h-[1px] bg-foreground/20 group-hover:w-12 group-hover:bg-accent transition-all" />
              <span className="font-body text-[10px] tracking-[0.4em] uppercase text-foreground/40 group-hover:text-foreground transition-colors">
                Explore More Artifacts
              </span>
            </Link>
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <div className="bg-foreground/5 p-8 lg:p-12 space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <h2 className="font-display text-4xl uppercase tracking-tighter">Summary</h2>

              <div className="space-y-6">
                <div className="flex justify-between items-baseline border-b border-foreground/5 pb-4">
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/40">Subtotal</span>
                  <span className="font-display text-2xl">{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-foreground/5 pb-4">
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/40">Entities</span>
                  <span className="font-display text-2xl">{cart.item_count}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-foreground/10 pb-4 pt-4">
                  <span className="font-body text-[11px] tracking-[0.3em] uppercase font-bold">Aggregate</span>
                  <span className="font-display text-4xl text-accent">{formatCurrency(cart.subtotal)}</span>
                </div>
                <p className="font-body text-[8px] tracking-[0.1em] uppercase text-foreground/30 text-right italic">
                  Shipping and levies calculated at acquisition
                </p>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full h-16 bg-foreground text-background font-body text-[11px] tracking-[0.4em] uppercase hover:bg-accent hover:text-foreground transition-all flex items-center justify-center gap-3 group"
              >
                Checkout Access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="space-y-6 pt-12 border-t border-foreground/5">
                <h4 className="font-body text-[8px] tracking-[0.4em] uppercase text-foreground/30 font-bold">Secure Protocols</h4>
                <div className="flex justify-between opacity-20 grayscale hover:grayscale-0 transition-all cursor-default">
                  {['VISA', 'MC', 'AMEX', 'UPI'].map(pay => (
                    <span key={pay} className="font-display text-xs tracking-widest">{pay}</span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;