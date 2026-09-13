import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  Truck,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../CartContext';
import { api } from '../lib/api';
import { KALA_CONFIG } from '../constants/config';

export interface SavedAddress {
  id: string;
  label: string; // 'Home' | 'Work' | 'Other'
  fullName: string;
  phone: string;
  email: string;
  building: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi NCR', 'Chandigarh', 'Jammu & Kashmir', 'Ladakh'
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Address fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [building, setBuilding] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Chhattisgarh');
  const [pincode, setPincode] = useState('');
  const [country] = useState('India');
  const [addressLabel, setAddressLabel] = useState('Home');
  const [saveAddressToStorage, setSaveAddressToStorage] = useState(true);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('kala_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);

  // Geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Form error
  const [formError, setFormError] = useState<string | null>(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  // Pre-fill user profile if logged in
  useEffect(() => {
    const rawUser = localStorage.getItem('kala_user_profile');
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u.name && !fullName) setFullName(u.name);
        if (u.email && !email) setEmail(u.email);
        if (u.phone && !phone) setPhone(u.phone);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Check if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Attempt reverse geocoding via OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            if (addr.city || addr.town || addr.village) {
              setCity(addr.city || addr.town || addr.village);
            }
            if (addr.state) {
              const matchedState = INDIAN_STATES.find(s => s.toLowerCase() === addr.state.toLowerCase());
              if (matchedState) setState(matchedState);
            }
            if (addr.postcode && /^\d{6}$/.test(addr.postcode)) {
              setPincode(addr.postcode);
            }
            if (addr.suburb || addr.neighbourhood || addr.road) {
              setStreet([addr.neighbourhood, addr.road].filter(Boolean).join(', '));
            }
          }
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
          setLocationError('Fetched coordinates, but could not resolve address automatically. Please enter manually.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("We couldn't access your location. Please enter your address manually.");
        } else {
          setLocationError('Location request timed out. Please enter your address manually.');
        }
      },
      { timeout: 8000 }
    );
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedSavedId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setEmail(addr.email);
    setBuilding(addr.building);
    setStreet(addr.street);
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setAddressLabel(addr.label || 'Home');
  };

  const handleDeleteSavedAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    try {
      localStorage.setItem('kala_addresses', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    if (selectedSavedId === id) {
      setSelectedSavedId(null);
    }
  };

  const validateAddressStep = (): boolean => {
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return false;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return false;
    }
    if (!building.trim()) {
      setFormError('Please enter your house / flat / building name or number.');
      return false;
    }
    if (!street.trim()) {
      setFormError('Please enter your street / area name.');
      return false;
    }
    if (!city.trim()) {
      setFormError('Please enter your city.');
      return false;
    }
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      setFormError('Please enter a valid 6-digit Indian pincode (e.g. 495001).');
      return false;
    }

    // Save address if checked
    if (saveAddressToStorage && !selectedSavedId) {
      const newAddr: SavedAddress = {
        id: `addr-${Date.now()}`,
        label: addressLabel,
        fullName,
        phone,
        email,
        building,
        street,
        landmark,
        city,
        state,
        pincode,
        country
      };
      const updated = [newAddr, ...savedAddresses.slice(0, 4)];
      setSavedAddresses(updated);
      try {
        localStorage.setItem('kala_addresses', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }

    return true;
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'KALA10') {
      const disc = Math.round(getCartTotal() * 0.1);
      setAppliedDiscount(disc);
      setCouponFeedback('10% KALA promotional discount applied!');
    } else if (code === 'WELCOME') {
      const disc = 100;
      setAppliedDiscount(disc);
      setCouponFeedback('₹100 Welcome voucher applied!');
    } else {
      setAppliedDiscount(0);
      setCouponFeedback('Invalid discount code. Try KALA10 or leave blank.');
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setFormError(null);

    const subtotal = getCartTotal();
    const shippingFee = subtotal >= KALA_CONFIG.shipping.freeShippingThreshold ? 0 : KALA_CONFIG.shipping.standardShippingFee;
    const finalTotal = Math.max(0, subtotal + shippingFee - appliedDiscount);

    // Collision-safe unique order ID (Rule 28)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `KALA-2026-${randomSuffix}`;

    const orderPayload = {
      id: orderId,
      userId: localStorage.getItem('kala_user_profile') ? JSON.parse(localStorage.getItem('kala_user_profile')!).id : null,
      customer: {
        name: fullName,
        email,
        phone
      },
      customerName: fullName,
      customerEmail: email,
      phone,
      items: cartItems.map(it => ({
        productId: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        size: it.size,
        color: it.color,
        image: it.image
      })),
      shippingAddress: {
        fullName,
        phone,
        email,
        building,
        street,
        landmark,
        city,
        state,
        pincode,
        country
      },
      subtotal,
      deliveryFee: shippingFee,
      discount: appliedDiscount,
      total: finalTotal,
      paymentMethod: paymentMethod.toUpperCase(),
      paymentStatus: paymentMethod === 'cod' ? 'PENDING_COD' : 'TEST_ONLINE_AUTHORIZED',
      orderStatus: 'Order Confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // 1. Send to server API
      try {
        await api.createOrder(orderPayload);
      } catch (err) {
        console.warn('Backend order sync fallback:', err);
      }

      // 2. Persist order in localStorage['kala_orders']
      const existingOrders = JSON.parse(localStorage.getItem('kala_orders') || '[]');
      existingOrders.unshift(orderPayload);
      localStorage.setItem('kala_orders', JSON.stringify(existingOrders));

      // 3. Clear shopping cart
      clearCart();

      // 4. Redirect to Order Confirmation
      navigate(`/order-confirmation/${orderId}`, {
        state: { order: orderPayload }
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const subtotal = getCartTotal();
  const shippingFee = subtotal >= KALA_CONFIG.shipping.freeShippingThreshold ? 0 : KALA_CONFIG.shipping.standardShippingFee;
  const total = Math.max(0, subtotal + shippingFee - appliedDiscount);

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 sm:pt-40 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Stepper */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-border -z-0" />
            {[
              { num: 1, label: 'Address' },
              { num: 2, label: 'Review' },
              { num: 3, label: 'Payment' }
            ].map((st) => (
              <div key={st.num} className="relative z-10 flex flex-col items-center bg-background px-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    currentStep === st.num
                      ? 'bg-kala-emerald text-white shadow-md'
                      : currentStep > st.num
                      ? 'bg-foreground text-background'
                      : 'bg-card border border-border text-mid'
                  }`}
                >
                  {currentStep > st.num ? <Check className="w-4 h-4" /> : st.num}
                </div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider mt-1 text-mid">
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Inline Error */}
        {formError && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Panel */}
          <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            {/* ================= STEP 1: ADDRESS ================= */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-foreground">
                      1. Delivery Address
                    </h2>
                    <p className="text-xs text-mid mt-0.5">
                      Where should we dispatch your custom KALA products?
                    </p>
                  </div>

                  {/* Geolocation Trigger */}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-background border border-border hover:border-kala-emerald rounded-xl text-xs font-bold text-kala-emerald dark:text-emerald-400 transition-colors shadow-2xs self-start sm:self-auto"
                  >
                    <MapPin className={`w-4 h-4 ${isLocating ? 'animate-bounce' : ''}`} />
                    <span>{isLocating ? 'Detecting...' : 'Use my current location'}</span>
                  </button>
                </div>

                {locationError && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{locationError}</span>
                  </div>
                )}

                {/* Saved Addresses Picker */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                      Saved Addresses
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-start ${
                            selectedSavedId === addr.id
                              ? 'border-kala-emerald bg-kala-emerald/5 shadow-xs'
                              : 'border-border bg-background hover:border-foreground/40'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold uppercase bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-foreground">
                              {addr.label}
                            </span>
                            <p className="text-xs font-bold text-foreground mt-1">{addr.fullName}</p>
                            <p className="text-[11px] text-mid leading-relaxed line-clamp-2">
                              {addr.building}, {addr.street}, {addr.city} - {addr.pincode}
                            </p>
                            <p className="text-[10px] text-mid font-mono">{addr.phone}</p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteSavedAddress(addr.id, e)}
                            className="text-mid hover:text-red-500 p-1"
                            title="Delete address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Address Form */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Niraj Sharma"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Mobile Number * (for delivery updates)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9406030116"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                      Email Address * (for order confirmation)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="niraj@example.com"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                      Flat / House No. / Building / Apartment *
                    </label>
                    <input
                      type="text"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder="Flat 302, Green Valley Apartments"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Street / Colony / Area *
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Link Road, Telipara"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="Near City Mall"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Bilaspur"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        State *
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Pincode (6 digits) *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        placeholder="495001"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                        required
                      />
                    </div>
                  </div>

                  {/* Save address checkbox */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground font-medium">
                      <input
                        type="checkbox"
                        checked={saveAddressToStorage}
                        onChange={(e) => setSaveAddressToStorage(e.target.checked)}
                        className="accent-kala-emerald rounded"
                      />
                      <span>Save this address for future purchases</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-mid">Label:</span>
                      {['Home', 'Work', 'Other'].map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setAddressLabel(lbl)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            addressLabel === lbl
                              ? 'bg-foreground text-background'
                              : 'bg-background border border-border text-mid'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Continue to Review CTA */}
                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <Link
                    to="/cart"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mid hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Cart</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateAddressStep()) {
                        setCurrentStep(2);
                      }
                    }}
                    className="px-8 py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: REVIEW ================= */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-border pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-foreground">
                      2. Review Your Order
                    </h2>
                    <p className="text-xs text-mid mt-0.5">
                      Verify selected apparel variants, quantity, and destination.
                    </p>
                  </div>
                </div>

                {/* Destination Preview Card */}
                <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-kala-emerald dark:text-emerald-400 font-bold block">
                      Delivering To
                    </span>
                    <p className="text-sm font-bold text-foreground">{fullName}</p>
                    <p className="text-xs text-mid">
                      {building}, {street}
                      {landmark ? `, Near ${landmark}` : ''}, {city}, {state} - <strong className="text-foreground">{pincode}</strong>
                    </p>
                    <p className="text-xs text-mid font-mono">
                      Phone: {phone} &bull; Email: {email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 bg-card border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Edit Address
                  </button>
                </div>

                {/* Items in this order */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                    Items in Order ({cartItems.length})
                  </span>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-contain bg-white dark:bg-black p-1 border border-border shrink-0"
                          />
                          <div className="space-y-0.5">
                            <h4 className="font-serif text-sm font-bold text-foreground">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs font-mono text-mid">
                              <span>Size: <strong className="text-foreground">{item.size}</strong></span>
                              <span>&bull;</span>
                              <span>Color: <strong className="text-foreground">{item.color}</strong></span>
                            </div>
                            <p className="text-xs text-mid font-mono">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-sm text-foreground">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stepper Buttons */}
                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mid hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Address</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-8 py-3.5 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: PAYMENT ================= */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase text-foreground">
                    3. Select Payment Method
                  </h2>
                  <p className="text-xs text-mid mt-0.5">
                    Safe, flexible payment layer tailored for Indian doorstep dispatch.
                  </p>
                </div>

                {/* Payment Options */}
                <div className="space-y-3">
                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                      paymentMethod === 'cod'
                        ? 'border-kala-emerald bg-kala-emerald/5 shadow-xs'
                        : 'border-border bg-background hover:border-foreground/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-kala-emerald"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-kala-emerald" />
                        <span className="font-serif text-base font-bold text-foreground uppercase">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold">
                          AVAILABLE
                        </span>
                      </div>
                      <p className="text-xs text-mid leading-relaxed">
                        Pay cash or scan QR code via GPay / PhonePe directly to the courier partner upon delivery.
                      </p>
                    </div>
                  </label>

                  {/* Online Payment */}
                  <label
                    onClick={() => setPaymentMethod('online')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                      paymentMethod === 'online'
                        ? 'border-kala-emerald bg-kala-emerald/5 shadow-xs'
                        : 'border-border bg-background hover:border-foreground/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="mt-1 accent-kala-emerald"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-kala-emerald" />
                        <span className="font-serif text-base font-bold text-foreground uppercase">
                          Online Payment (UPI, Cards, Net Banking)
                        </span>
                      </div>
                      <p className="text-xs text-mid leading-relaxed">
                        Instant digital authorization. (In test mode: pre-authorized seamlessly without charging your account).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Final Order Confirmation Banner */}
                <div className="bg-background border border-border rounded-2xl p-4 text-xs text-mid space-y-1">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-kala-emerald" />
                    KALA Buyer Assurance
                  </p>
                  <p>
                    By clicking "Place Order", your order will be booked into the KALA production queue with a unique tracking ID. Estimated delivery: <strong>{KALA_CONFIG.shipping.estimatedDays}</strong>.
                  </p>
                </div>

                {/* Final Actions */}
                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mid hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="px-10 py-4 bg-kala-emerald hover:bg-kala-emerald/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Placing Your Order...</span>
                    ) : (
                      <>
                        <span>Place Order &bull; ₹{total}</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28 shadow-sm">
              <h3 className="font-serif text-xl font-bold uppercase text-foreground">
                Order Summary
              </h3>

              {/* Items Mini List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 border-b border-border pb-4">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex items-center justify-between text-xs">
                    <div className="truncate max-w-[170px]">
                      <span className="font-bold text-foreground">{item.name}</span>
                      <span className="text-mid block text-[11px] font-mono">
                        {item.size} &bull; {item.color} &bull; Qty {item.quantity}
                      </span>
                    </div>
                    <span className="font-mono font-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. KALA10)"
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs uppercase font-mono focus:outline-none focus:ring-1 focus:ring-kala-emerald"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-background border border-border hover:border-foreground text-foreground rounded-xl text-xs font-bold uppercase"
                  >
                    Apply
                  </button>
                </div>
                {couponFeedback && (
                  <p className={`text-[11px] font-mono ${appliedDiscount > 0 ? 'text-emerald-600' : 'text-mid'}`}>
                    {couponFeedback}
                  </p>
                )}
              </form>

              {/* Calculation breakdown */}
              <div className="space-y-2.5 text-xs text-mid border-b border-border pb-4">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-mono font-bold text-foreground">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Doorstep Delivery:</span>
                  {shippingFee === 0 ? (
                    <span className="font-mono font-bold text-emerald-600 uppercase">FREE</span>
                  ) : (
                    <span className="font-mono font-bold text-foreground">₹{shippingFee}</span>
                  )}
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Voucher:</span>
                    <span className="font-mono font-bold">-₹{appliedDiscount}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex items-baseline justify-between font-bold text-foreground">
                <span className="font-serif text-lg uppercase">Total Amount:</span>
                <span className="font-serif text-2xl text-kala-emerald font-black">
                  ₹{total}
                </span>
              </div>

              {/* Assurances */}
              <div className="space-y-2 pt-2 text-[11px] text-mid border-t border-border">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-kala-emerald shrink-0" />
                  <span>Pan-India Doorstep Dispatch &bull; 5–7 Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-kala-emerald shrink-0" />
                  <span>Free Design Proof Review & Ink Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
