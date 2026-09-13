import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Package, Truck, Home, MessageCircle, AlertCircle } from 'lucide-react';
import { KALA_CONFIG } from '../constants/config';

const STATUS_STEPS = [
  { key: 'Order Confirmed', label: 'Order Confirmed', icon: Check },
  { key: 'Processing', label: 'Processing & Proof Review', icon: Clock },
  { key: 'Production', label: 'In Studio Production', icon: Package },
  { key: 'Shipped', label: 'Dispatched / Shipped', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Home }
];

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    try {
      const stored = JSON.parse(localStorage.getItem('kala_orders') || '[]');
      const found = stored.find((o: any) => o.id === id);
      if (found) {
        setOrder(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-40 pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-kala-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-40 pb-24">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-mid mx-auto opacity-50" />
          <h2 className="font-serif text-3xl font-bold uppercase">Order Not Found</h2>
          <p className="text-xs text-mid">
            Could not find an order matching identifier "{id}". Please verify your order number.
          </p>
          <div className="pt-2">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-kala-emerald text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Orders</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = order.orderStatus || 'Order Confirmed';
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Order Confirmed': return 0;
      case 'Processing':
      case 'Design Review': return 1;
      case 'Production': return 2;
      case 'Shipped':
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Back Link */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mid hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Order Header */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-kala-emerald dark:text-emerald-400 font-bold block">
                KALA Production Order
              </span>
              <h1 className="font-serif text-3xl font-bold text-foreground mt-0.5">
                {order.id}
              </h1>
            </div>

            <div className="text-left sm:text-right">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-mono text-xs font-bold uppercase">
                {currentStatus}
              </span>
              <p className="text-[11px] text-mid mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Visual Progress Timeline (Rule 31) */}
          <div className="pt-4 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-6">
              Production & Delivery Progress
            </span>

            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-5 left-6 right-6 h-[2px] bg-border hidden sm:block -z-0" />

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                {STATUS_STEPS.map((st, idx) => {
                  const isCompleted = idx <= activeIndex;
                  const isCurrent = idx === activeIndex;
                  const StepIcon = st.icon;

                  return (
                    <div key={st.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                          isCompleted
                            ? 'bg-kala-emerald text-white shadow-md'
                            : 'bg-background border border-border text-mid'
                        } ${isCurrent ? 'ring-4 ring-kala-emerald/20' : ''}`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isCompleted ? 'text-foreground' : 'text-mid'}`}>
                          {st.label}
                        </span>
                        <span className="text-[10px] font-mono text-mid">
                          {isCurrent ? 'Current Status' : isCompleted ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Items */}
          <div className="md:col-span-8 bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-serif text-lg font-bold uppercase text-foreground border-b border-border pb-3">
              Ordered Items ({order.items?.length || 0})
            </h3>

            <div className="space-y-3">
              {order.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-contain bg-white dark:bg-black p-1 border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-mid" />
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <h4 className="font-serif text-sm font-bold text-foreground">
                        {item.name}
                      </h4>
                      <p className="text-xs text-mid font-mono">
                        Size: <strong className="text-foreground">{item.size}</strong> &bull; Color: <strong className="text-foreground">{item.color}</strong>
                      </p>
                      <p className="text-xs text-mid">Quantity: {item.quantity}</p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-sm text-foreground">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-border pt-4 space-y-2 text-xs text-mid">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-foreground">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Doorstep Shipping:</span>
                <span className="font-mono font-bold text-foreground">
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount Applied:</span>
                  <span className="font-mono font-bold">-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-foreground border-t border-border pt-3">
                <span>Total Amount:</span>
                <span className="font-serif text-xl text-kala-emerald">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Help Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xs text-xs">
              <h3 className="font-serif text-base font-bold uppercase text-foreground border-b border-border pb-2">
                Shipping Address
              </h3>
              <div className="space-y-1 text-mid leading-relaxed">
                <p className="font-bold text-foreground">{order.customer?.name || order.customerName}</p>
                <p>
                  {order.shippingAddress?.building}, {order.shippingAddress?.street}
                  {order.shippingAddress?.landmark ? `, Near ${order.shippingAddress.landmark}` : ''},
                  <br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong className="text-foreground">{order.shippingAddress?.pincode}</strong>
                </p>
                <p className="font-mono pt-1 text-foreground">
                  Phone: {order.customer?.phone || order.phone}
                </p>
              </div>

              <h3 className="font-serif text-base font-bold uppercase text-foreground border-b border-border pb-2 pt-2">
                Payment Method
              </h3>
              <p className="text-foreground font-semibold">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment Authorized'}
              </p>
            </div>

            {/* WhatsApp Support Box */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-3xl p-6 space-y-3 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                Need updates or print modifications?
              </span>
              <p className="text-emerald-700/90 dark:text-emerald-300/80 leading-relaxed">
                Connect with our studio team directly on WhatsApp referencing your Order ID.
              </p>
              <a
                href={`https://wa.me/${KALA_CONFIG.whatsapp}?text=Hi%20KALA%2C%20I%20have%20a%20question%20regarding%20my%20order%20${order.id}.`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
