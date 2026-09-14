import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, ShoppingBag, Eye } from 'lucide-react';
import { KALA_CONFIG } from '../constants/config';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [order, setOrder] = useState<any>(location.state?.order || null);

  useEffect(() => {
    if (!order && id) {
      try {
        const stored = JSON.parse(localStorage.getItem('kala_orders') || '[]');
        const found = stored.find((o: any) => o.id === id);
        if (found) {
          setOrder(found);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [id, order]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Celebratory Banner */}
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-kala-emerald dark:text-emerald-400">
              Order Confirmed ✓
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-black uppercase text-foreground">
              Thank you for choosing KALA.
            </h1>
            <p className="text-xs sm:text-sm text-mid max-w-md mx-auto leading-relaxed pt-1">
              Your apparel and design specifications are now in the production queue. We're crafting your pieces with precision.
            </p>
          </div>

          {/* Key Reference Pills */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
            <div className="bg-background border border-border px-4 py-2 rounded-xl">
              <span className="text-mid uppercase text-[10px] block">Order ID</span>
              <strong className="text-foreground text-sm font-black">{id || 'KALA-ORDER'}</strong>
            </div>

            <div className="bg-background border border-border px-4 py-2 rounded-xl">
              <span className="text-mid uppercase text-[10px] block">Estimated Delivery</span>
              <strong className="text-foreground text-sm font-black">{KALA_CONFIG.shipping.estimatedDays}</strong>
            </div>

            {order?.total && (
              <div className="bg-background border border-border px-4 py-2 rounded-xl">
                <span className="text-mid uppercase text-[10px] block">Total Amount</span>
                <strong className="text-kala-emerald text-sm font-black">₹{order.total}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Order Details & Summary Card */}
        {order && (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold uppercase text-foreground">
                Order Summary
              </h2>
              <span className="text-xs font-mono text-mid">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {order.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-contain bg-white dark:bg-black p-1 border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-mid" />
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <h4 className="font-serif text-sm font-bold text-foreground">
                        {item.name}
                      </h4>
                      <p className="text-xs text-mid font-mono">
                        {item.size} &bull; {item.color} &bull; Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-sm text-foreground">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Delivery & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border text-xs">
              <div className="space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-mid block">
                  Delivery Destination
                </span>
                <p className="font-bold text-foreground">{order.customer?.name || order.customerName}</p>
                <p className="text-mid leading-relaxed">
                  {order.shippingAddress?.building}, {order.shippingAddress?.street}
                  {order.shippingAddress?.landmark ? `, Near ${order.shippingAddress.landmark}` : ''}, <br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                <p className="font-mono text-mid pt-1">
                  Phone: {order.customer?.phone || order.phone}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-mid block">
                  Payment Details
                </span>
                <p className="font-bold text-foreground">
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment Authorized'}
                </p>
                <p className="text-mid">
                  {order.paymentMethod === 'COD'
                    ? 'Payment of ₹' + order.total + ' to be collected upon doorstep delivery.'
                    : 'Payment verified and logged for production queue.'}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-mono text-[10px] font-bold uppercase">
                    Status: {order.orderStatus || 'Order Confirmed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {id && (
            <Link
              to={`/orders/${id}`}
              className="w-full sm:w-auto px-8 py-3.5 bg-card border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Eye className="w-4 h-4" />
              <span>View Order Timeline</span>
            </Link>
          )}

          <Link
            to="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          <Link
            to="/orders"
            className="w-full sm:w-auto px-6 py-3.5 bg-background border border-border text-mid hover:text-foreground rounded-xl text-xs font-bold uppercase tracking-wider text-center"
          >
            My Orders History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
