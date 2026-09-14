import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Eye, ShoppingBag } from 'lucide-react';
import { api } from '../lib/api';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      // 1. Try local storage orders first
      let localOrders: any[] = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('kala_orders') || '[]');
      } catch (err) {
        console.error(err);
      }

      // 2. Try fetching from backend if auth token exists
      const token = localStorage.getItem('kala_auth_token');
      if (token) {
        try {
          const res = await api.getOrders();
          if (res && res.orders) {
            // Merge unique by id
            const merged = [...localOrders];
            res.orders.forEach((o: any) => {
              if (!merged.some(m => m.id === o.id)) {
                merged.push(o);
              }
            });
            setOrders(merged);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('API getOrders failed, using local orders:', err);
        }
      }

      setOrders(localOrders);
      setIsLoading(false);
    }

    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-kala-emerald dark:text-emerald-400 block mb-1">
              ACCOUNT & HISTORY
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black uppercase text-foreground">
              My Orders ({orders.length})
            </h1>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-kala-emerald hover:underline self-start sm:self-auto"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Orders List or Empty State */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-kala-emerald border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-mid uppercase">Loading order history...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xs hover:shadow-md transition-shadow"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-mid uppercase tracking-widest block">
                      Order Reference
                    </span>
                    <strong className="font-mono text-sm sm:text-base font-black text-foreground">
                      {order.id}
                    </strong>
                    <p className="text-xs text-mid font-mono">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-mono text-xs font-bold uppercase">
                      {order.orderStatus || 'Order Confirmed'}
                    </span>
                    <Link
                      to={`/orders/${order.id}`}
                      className="px-4 py-2 bg-background border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Order</span>
                    </Link>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-2.5">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-3 truncate max-w-[280px] sm:max-w-md">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-contain bg-white dark:bg-black p-0.5 border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-mid" />
                          </div>
                        )}
                        <span className="font-bold text-foreground truncate">
                          {item.quantity}x {item.name}
                          {item.size ? ` (${item.size})` : ''}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-foreground shrink-0">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer totals & destination */}
                <div className="border-t border-border pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-mid">
                    Delivering to: <strong className="text-foreground">{order.customer?.name || order.customerName}</strong> ({order.shippingAddress?.city || 'India'})
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-mid">Total Paid/COD:</span>
                    <span className="font-serif text-lg font-bold text-kala-emerald">₹{order.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty orders state (Rule 49) */
          <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-mid">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold uppercase text-foreground">
              You haven't placed any orders yet.
            </h2>
            <p className="text-xs sm:text-sm text-mid leading-relaxed">
              Explore our custom streetwear designs, gym sets, or esports jerseys.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Start Shopping</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
