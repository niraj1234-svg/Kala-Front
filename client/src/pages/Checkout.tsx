import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder, validateCoupon } from '../services/orderApi'
import type { CreateOrderPayload, ValidateCouponResponse } from '../services/orderApi'
import { createRazorpayOrder, verifyRazorpayPayment, loadRazorpayScript } from '../services/paymentApi'
import type { RazorpayOptions, RazorpaySuccessResponse, RazorpayErrorResponse } from '../types/razorpay'
import { saveOrder } from '../types/order'
import '../styles/Checkout.css'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pinCode: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

export const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { cartItems, cartCount, cartSubtotal, clearCart } = useCart()
  const { currentUser, isAuthenticated, isLoading } = useAuth()

  const [formData, setFormData] = useState<FormData>(() => ({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
  }))

  // Auto-sync customer details once authenticated user is loaded
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || currentUser.firstName || '',
        lastName: prev.lastName || currentUser.lastName || '',
        email: currentUser.email || prev.email || '',
        phone: prev.phone || currentUser.phone || '',
      }))
    }
  }, [currentUser])

  // Authentication guard: redirect to login if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/account?redirect=/checkout&message=Please%20log%20in%20to%20continue%20with%20your%20purchase.', {
        replace: true,
      })
    }
  }, [isLoading, isAuthenticated, navigate])

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)

  // Coupon state
  const [couponInput, setCouponInput] = useState<string>('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    discount: number
    subtotal: number
    shipping: number
    total: number
  } | null>(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null)

  // Cart mutation reactivity: automatically revalidate or invalidate coupon when cart changes
  const cartKey = JSON.stringify(
    cartItems.map((it) => ({ id: it.productId, s: it.size, q: it.quantity, c: it.customization?.backText }))
  )
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Reset pending order if cart items change so new order matches latest cart
    setPendingOrderId(null)
  }, [cartKey])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (!appliedCoupon) return

    let cancelled = false
    const revalidate = async () => {
      try {
        const res: ValidateCouponResponse = await validateCoupon({
          code: appliedCoupon.code,
          items: cartItems.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            customization: item.customization,
          })),
        })
        if (!cancelled && res.success && res.coupon && res.pricing) {
          setAppliedCoupon({
            code: res.coupon.code,
            discountType: res.coupon.discountType,
            discountValue: res.coupon.discountValue,
            discount: res.pricing.discount,
            subtotal: res.pricing.subtotal,
            shipping: res.pricing.shipping,
            total: res.pricing.total,
          })
        }
      } catch (err: any) {
        if (!cancelled) {
          setAppliedCoupon(null)
          setCouponError(`Coupon removed: ${err.message || 'Cart no longer meets requirements.'}`)
          setCouponSuccess(null)
        }
      }
    }

    revalidate()
    return () => {
      cancelled = true
    }
  }, [cartKey])

  // Authentication loading state
  if (isLoading) {
    return (
      <main className="kala-container kala-checkout-page" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', letterSpacing: '0.1em' }}>CHECKING AUTHENTICATION...</p>
      </main>
    )
  }

  // If not authenticated, prevent rendering while redirect effect executes
  if (!isAuthenticated) {
    return null
  }

  // Empty cart protection
  if (cartItems.length === 0) {
    return (
      <main className="kala-container kala-checkout-page">
        <div className="kala-cart-empty">
          <h1 className="kala-cart-empty-title">YOUR CART IS EMPTY</h1>
          <p className="kala-cart-empty-desc">
            Your cart has no items to checkout. Add items from the collection to proceed.
          </p>
          <Link to="/shop" className="kala-btn kala-btn-primary">
            CONTINUE SHOPPING
          </Link>
        </div>
      </main>
    )
  }

  // Pricing calculations (Server is ultimate authority; frontend displays responsive values)
  const baseShippingCost = cartSubtotal >= 2000 ? 0 : 99
  const displaySubtotal = appliedCoupon ? appliedCoupon.subtotal : cartSubtotal
  const displayDiscount = appliedCoupon ? appliedCoupon.discount : 0
  const displayShipping = appliedCoupon ? appliedCoupon.shipping : baseShippingCost
  const displayTotal = appliedCoupon
    ? appliedCoupon.total
    : cartSubtotal + baseShippingCost

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for field being edited
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (orderError) {
      setOrderError(null)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 1. First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required.'
    }

    // 2. Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required.'
    }

    // 3. Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    // 4. Phone (Indian 10-digit format)
    const cleanPhone = formData.phone.replace(/[\s-+]/g, '')
    const phoneRegex = /^[6-9]\d{9}$/
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.'
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number.'
    }

    // 5. Address Line 1
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required.'
    }

    // 6. City
    if (!formData.city.trim()) {
      newErrors.city = 'City is required.'
    }

    // 7. State
    if (!formData.state.trim()) {
      newErrors.state = 'State is required.'
    }

    // 8. PIN Code (6-digit Indian PIN)
    const pinRegex = /^\d{6}$/
    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'PIN code is required.'
    } else if (!pinRegex.test(formData.pinCode.trim())) {
      newErrors.pinCode = 'Please enter a valid 6-digit Indian PIN code.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setCouponError(null)
    setCouponSuccess(null)

    const cleanCode = couponInput.trim().toUpperCase()
    if (!cleanCode) {
      setCouponError('Please enter a coupon code.')
      return
    }

    if (cartItems.length === 0) {
      setCouponError('Your cart is empty.')
      return
    }

    setIsApplyingCoupon(true)

    try {
      const res: ValidateCouponResponse = await validateCoupon({
        code: cleanCode,
        items: cartItems.map((item) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          customization: item.customization,
        })),
      })

      if (res.success && res.coupon && res.pricing) {
        setAppliedCoupon({
          code: res.coupon.code,
          discountType: res.coupon.discountType,
          discountValue: res.coupon.discountValue,
          discount: res.pricing.discount,
          subtotal: res.pricing.subtotal,
          shipping: res.pricing.shipping,
          total: res.pricing.total,
        })
        setCouponSuccess(
          `Coupon '${res.coupon.code}' applied! Saved ₹${res.pricing.discount.toLocaleString('en-IN')}`
        )
        setCouponError(null)
        setCouponInput('')
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code.')
      setCouponSuccess(null)
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError(null)
    setCouponSuccess(null)
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setOrderError(null)

    if (!isAuthenticated) {
      navigate('/account?redirect=/checkout&message=Please%20log%20in%20to%20continue%20with%20your%20purchase.', {
        replace: true,
      })
      return
    }

    if (!validateForm()) {
      return
    }

    // Verify every cart item has size
    const hasInvalidItem = cartItems.some((item) => !item.size)
    if (hasInvalidItem) {
      setOrderError('One or more items in your cart is missing a size selection.')
      return
    }

    setIsSubmitting(true)

    // Construct server-safe payload (server authoritatively calculates discount & total)
    const payload: CreateOrderPayload = {
      customer: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      },
      shippingAddress: {
        address: [formData.addressLine1.trim(), formData.addressLine2.trim()].filter(Boolean).join(', '),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pinCode.trim(),
      },
      items: cartItems.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        customization: item.customization,
      })),
      ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
    }

    try {
      let targetOrderId = pendingOrderId
      let activeOrder = null

      // 1. If we don't have an active pending order for this cart, create one in MongoDB
      if (!targetOrderId) {
        const response = await createOrder(payload)
        if (!response || !response.success || !response.orderId) {
          throw new Error('Unable to place your order right now. Please try again.')
        }
        targetOrderId = response.orderId
        activeOrder = response.order
        setPendingOrderId(response.orderId)
      }

      // 2. Ensure Razorpay Checkout SDK is loaded
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded || typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Payment gateway failed to load. Please check your internet connection.')
      }

      // 3. Create Razorpay order on the backend (amount authoritatively derived from DB order)
      const razorpayOrder = await createRazorpayOrder({
        orderId: targetOrderId,
      })

      if (!razorpayOrder || !razorpayOrder.order_id) {
        throw new Error(razorpayOrder?.message || 'Failed to initialize Razorpay checkout.')
      }

      // 4. Configure Razorpay Standard Web Checkout Modal
      const keyId = razorpayOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID

      if (!keyId) {
        throw new Error('Payment gateway configuration error: Razorpay Key ID not configured.')
      }

      const options: RazorpayOptions = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'KALA',
        description: `Order ${targetOrderId}`,
        image: '/favicon.png',
        order_id: razorpayOrder.order_id,
        handler: async (paymentResponse: RazorpaySuccessResponse) => {
          try {
            setIsSubmitting(true)

            // STEP 3: Verify signature with backend
            await verifyRazorpayPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              orderId: targetOrderId,
            })

            // Save order to local cache for fast offline display
            if (activeOrder) {
              try {
                saveOrder({
                  orderId: activeOrder.orderId,
                  createdAt: activeOrder.createdAt,
                  customer: {
                    firstName: activeOrder.customer.firstName,
                    lastName: activeOrder.customer.lastName,
                    email: activeOrder.customer.email,
                    phone: activeOrder.customer.phone,
                  },
                  shippingAddress: {
                    addressLine1: formData.addressLine1.trim(),
                    addressLine2: formData.addressLine2.trim() || undefined,
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pinCode: formData.pinCode.trim(),
                  },
                  items: activeOrder.items.map((it) => ({
                    productId: it.productId,
                    name: it.name,
                    size: it.size,
                    quantity: it.quantity,
                    price: it.price,
                    image: it.image,
                    customization: it.customization,
                  })),
                  subtotal: activeOrder.pricing.subtotal,
                  shipping: activeOrder.pricing.shipping,
                  total: activeOrder.pricing.total,
                  status: 'confirmed',
                })
              } catch {
                // Ignore localStorage failure
              }
            }

            // Clear cart ONLY after successful payment verification
            clearCart()
            setPendingOrderId(null)

            // Navigate to confirmation page
            navigate(`/order-confirmation/${targetOrderId}`)
          } catch (verifyErr: any) {
            console.error('[Checkout] Verification error:', verifyErr)
            setOrderError(
              verifyErr.message ||
                'Payment verification failed. If your money was debited, please contact support with Order ID: ' +
                  targetOrderId
            )
            setIsSubmitting(false)
          }
        },
        prefill: {
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },
        theme: {
          color: '#06413f',
        },
        modal: {
          ondismiss: () => {
            console.log('[Razorpay] Payment modal dismissed by user.')
            setIsSubmitting(false)
            setOrderError(
              'Payment was not completed. Your order has been saved as pending. You can click "PAY VIA RAZORPAY" below to retry.'
            )
          },
        },
      }

      // 5. Open Razorpay Checkout Modal
      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', (errResp: RazorpayErrorResponse) => {
        console.error('[Razorpay] Payment failed:', errResp)
        setIsSubmitting(false)
        setOrderError(
          errResp?.error?.description || 'Payment failed. Please try again with another card, UPI or payment method.'
        )
      })

      rzp.open()
    } catch (err: any) {
      console.error('[Checkout] Order placement error:', err)
      setOrderError(err.message || 'Unable to place your order right now. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="kala-container kala-checkout-page">
      <header className="kala-checkout-header">
        <h1 className="kala-h1" style={{ margin: 0 }}>
          CHECKOUT
        </h1>
      </header>

      <form onSubmit={handlePlaceOrder} noValidate className="kala-checkout-layout">
        {/* Left Side: Form Fields */}
        <div className="kala-checkout-form-container">
          {/* Section 1: Customer Information */}
          <section className="kala-checkout-section" aria-labelledby="customer-info-heading">
            <h2 id="customer-info-heading" className="kala-checkout-section-title">
              CUSTOMER INFORMATION
            </h2>
            <div className="kala-form-grid two-col">
              <div className="kala-form-group">
                <label htmlFor="firstName" className="kala-form-label">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={`kala-form-input ${errors.firstName ? 'error' : ''}`}
                  value={formData.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                />
                {errors.firstName && <span className="kala-form-error">{errors.firstName}</span>}
              </div>

              <div className="kala-form-group">
                <label htmlFor="lastName" className="kala-form-label">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className={`kala-form-input ${errors.lastName ? 'error' : ''}`}
                  value={formData.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                />
                {errors.lastName && <span className="kala-form-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="kala-form-grid two-col" style={{ marginTop: '1.25rem' }}>
              <div className="kala-form-group">
                <label htmlFor="email" className="kala-form-label">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`kala-form-input ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <span className="kala-form-error">{errors.email}</span>}
              </div>

              <div className="kala-form-group">
                <label htmlFor="phone" className="kala-form-label">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  className={`kala-form-input ${errors.phone ? 'error' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
                {errors.phone && <span className="kala-form-error">{errors.phone}</span>}
              </div>
            </div>
          </section>

          {/* Section 2: Shipping Address */}
          <section className="kala-checkout-section" aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="kala-checkout-section-title">
              SHIPPING ADDRESS
            </h2>

            <div className="kala-form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="addressLine1" className="kala-form-label">
                Address Line 1 *
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                placeholder="House / Flat / Block No., Street"
                className={`kala-form-input ${errors.addressLine1 ? 'error' : ''}`}
                value={formData.addressLine1}
                onChange={handleChange}
                autoComplete="address-line1"
              />
              {errors.addressLine1 && <span className="kala-form-error">{errors.addressLine1}</span>}
            </div>

            <div className="kala-form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="addressLine2" className="kala-form-label">
                Address Line 2 (Optional)
              </label>
              <input
                id="addressLine2"
                name="addressLine2"
                type="text"
                placeholder="Apartment, suite, landmark"
                className="kala-form-input"
                value={formData.addressLine2}
                onChange={handleChange}
                autoComplete="address-line2"
              />
            </div>

            <div className="kala-form-grid three-col">
              <div className="kala-form-group">
                <label htmlFor="city" className="kala-form-label">
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className={`kala-form-input ${errors.city ? 'error' : ''}`}
                  value={formData.city}
                  onChange={handleChange}
                  autoComplete="address-level2"
                />
                {errors.city && <span className="kala-form-error">{errors.city}</span>}
              </div>

              <div className="kala-form-group">
                <label htmlFor="state" className="kala-form-label">
                  State *
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  className={`kala-form-input ${errors.state ? 'error' : ''}`}
                  value={formData.state}
                  onChange={handleChange}
                  autoComplete="address-level1"
                />
                {errors.state && <span className="kala-form-error">{errors.state}</span>}
              </div>

              <div className="kala-form-group">
                <label htmlFor="pinCode" className="kala-form-label">
                  PIN Code *
                </label>
                <input
                  id="pinCode"
                  name="pinCode"
                  type="text"
                  placeholder="6 digits"
                  maxLength={6}
                  className={`kala-form-input ${errors.pinCode ? 'error' : ''}`}
                  value={formData.pinCode}
                  onChange={handleChange}
                  autoComplete="postal-code"
                />
                {errors.pinCode && <span className="kala-form-error">{errors.pinCode}</span>}
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Order Summary */}
        <aside className="kala-checkout-summary" aria-label="Order summary">
          <h2 className="kala-checkout-summary-title">
            ORDER SUMMARY ({cartCount})
          </h2>

          <div className="kala-checkout-items-list" role="list">
            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="kala-checkout-item"
                role="listitem"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="kala-checkout-item-img"
                />
                <div className="kala-checkout-item-info">
                  <div className="kala-checkout-item-name" title={item.name}>
                    {item.name}
                  </div>
                  <div className="kala-checkout-item-meta">
                    Size: {item.size} · Qty: {item.quantity}
                  </div>
                  {item.customization?.backText && (
                    <div className="kala-checkout-item-custom-text">
                      Back Text: "{item.customization.backText}" (+₹25)
                    </div>
                  )}
                </div>
                <div className="kala-checkout-item-total">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Section */}
          <div className="kala-checkout-coupon-section">
            <label htmlFor="checkout-coupon-input" className="kala-coupon-label">
              COUPON CODE
            </label>

            {appliedCoupon ? (
              <div className="kala-coupon-applied-box">
                <div className="kala-coupon-applied-info">
                  <span className="kala-coupon-badge">{appliedCoupon.code}</span>
                  <span className="kala-coupon-applied-text">
                    {appliedCoupon.discountType === 'percentage'
                      ? `${appliedCoupon.discountValue}% OFF`
                      : `₹${appliedCoupon.discountValue} OFF`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="kala-coupon-remove-btn"
                  aria-label="Remove coupon"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="kala-coupon-input-group">
                <input
                  id="checkout-coupon-input"
                  type="text"
                  placeholder="Coupon code (e.g. KALA20)"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase())
                    if (couponError) setCouponError(null)
                  }}
                  className="kala-coupon-input"
                  disabled={isApplyingCoupon}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleApplyCoupon()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  className="kala-btn kala-coupon-apply-btn"
                >
                  {isApplyingCoupon ? 'APPLYING...' : 'APPLY'}
                </button>
              </div>
            )}

            {couponSuccess && (
              <div className="kala-coupon-feedback success">{couponSuccess}</div>
            )}
            {couponError && (
              <div className="kala-coupon-feedback error">{couponError}</div>
            )}
          </div>

          <div className="kala-checkout-pricing">
            <div className="kala-checkout-pricing-row">
              <span>Subtotal</span>
              <span>₹{displaySubtotal.toLocaleString('en-IN')}</span>
            </div>

            {appliedCoupon && appliedCoupon.discount > 0 && (
              <div className="kala-checkout-pricing-row kala-pricing-discount-row">
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span className="kala-discount-value">
                  -₹{displayDiscount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="kala-checkout-pricing-row">
              <span>Shipping</span>
              <span>{displayShipping === 0 ? 'FREE' : `₹${displayShipping}`}</span>
            </div>

            <div className="kala-checkout-pricing-row total">
              <span>Total</span>
              <span>₹{displayTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {orderError && (
            <div
              className="kala-checkout-error-banner"
              style={{
                color: '#b91c1c',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '0.85rem',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                lineHeight: 1.4,
              }}
            >
              {orderError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="kala-btn kala-btn-primary kala-place-order-btn"
          >
            {isSubmitting
              ? 'PROCESSING PAYMENT...'
              : pendingOrderId && orderError
                ? `RETRY PAYMENT (₹${displayTotal.toLocaleString('en-IN')})`
                : `PAY ₹${displayTotal.toLocaleString('en-IN')} VIA RAZORPAY`}
          </button>

          <div
            style={{
              textAlign: 'center',
              marginTop: '0.75rem',
              fontSize: '0.75rem',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <span>🔒</span>
            <span>Secured by <strong>Razorpay</strong> · UPI, Cards, NetBanking, Wallets</span>
          </div>

          <Link to="/cart" className="kala-back-to-cart-link">
            ← Return to Cart
          </Link>
        </aside>
      </form>
    </main>
  )
}

export default Checkout
