import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { saveOrder, generateOrderId } from '../types/order'
import type { Order, CustomerInformation, ShippingAddress } from '../types/order'
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
  const { currentUser } = useAuth()

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

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

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

  const shippingCost = 0 // Free standard delivery
  const totalAmount = cartSubtotal + shippingCost

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for field being edited
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Verify every cart item has size
    const hasInvalidItem = cartItems.some((item) => !item.size)
    if (hasInvalidItem) {
      alert('One or more items in your cart is missing a size selection.')
      return
    }

    setIsSubmitting(true)

    const customer: CustomerInformation = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    }

    const shippingAddress: ShippingAddress = {
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim() || undefined,
      city: formData.city.trim(),
      state: formData.state.trim(),
      pinCode: formData.pinCode.trim(),
    }

    const orderId = generateOrderId()

    const newOrder: Order = {
      orderId,
      createdAt: new Date().toISOString(),
      customer,
      shippingAddress,
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      subtotal: cartSubtotal,
      shipping: shippingCost,
      total: totalAmount,
      status: 'confirmed',
    }

    // 1. Save order to localStorage without overwriting previous orders
    saveOrder(newOrder)

    // 2. Clear cart
    clearCart()

    // 3. Navigate to order confirmation
    navigate(`/order-confirmation/${orderId}`)
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
                  Phone Number (10 Digits) *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
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
          <section className="kala-checkout-section" aria-labelledby="shipping-address-heading">
            <h2 id="shipping-address-heading" className="kala-checkout-section-title">
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
                placeholder="House/Flat No., Building, Street"
                className={`kala-form-input ${errors.addressLine1 ? 'error' : ''}`}
                value={formData.addressLine1}
                onChange={handleChange}
                autoComplete="address-line1"
              />
              {errors.addressLine1 && (
                <span className="kala-form-error">{errors.addressLine1}</span>
              )}
            </div>

            <div className="kala-form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="addressLine2" className="kala-form-label">
                Address Line 2 <span className="optional">(Optional)</span>
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

            <div className="kala-form-grid two-col" style={{ marginBottom: '1.25rem' }}>
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
            </div>

            <div className="kala-form-group">
              <label htmlFor="pinCode" className="kala-form-label">
                PIN Code (6 Digits) *
              </label>
              <input
                id="pinCode"
                name="pinCode"
                type="text"
                maxLength={6}
                placeholder="e.g. 560001"
                className={`kala-form-input ${errors.pinCode ? 'error' : ''}`}
                value={formData.pinCode}
                onChange={handleChange}
                autoComplete="postal-code"
              />
              {errors.pinCode && <span className="kala-form-error">{errors.pinCode}</span>}
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
                </div>
                <div className="kala-checkout-item-total">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div className="kala-checkout-pricing">
            <div className="kala-checkout-pricing-row">
              <span>Subtotal</span>
              <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="kala-checkout-pricing-row">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
            </div>

            <div className="kala-checkout-pricing-row total">
              <span>Total</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="kala-btn kala-btn-primary kala-place-order-btn"
          >
            {isSubmitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
          </button>

          <Link to="/cart" className="kala-back-to-cart-link">
            ← Return to Cart
          </Link>
        </aside>
      </form>
    </main>
  )
}

export default Checkout
