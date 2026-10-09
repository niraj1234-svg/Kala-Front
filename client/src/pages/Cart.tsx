import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import '../styles/Cart.css'

export const Cart: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { cartItems, cartCount, cartSubtotal, isCartLoading, removeFromCart, updateQuantity } = useCart()

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/account?redirect=/checkout&message=Please%20log%20in%20or%20create%20an%20account%20to%20continue%20with%20your%20purchase.')
      return
    }
    navigate('/checkout')
  }

  if (isCartLoading) {
    return (
      <main className="kala-container kala-cart-page" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', letterSpacing: '0.1em' }}>LOADING YOUR CART...</p>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main className="kala-container kala-cart-page">
        <div className="kala-cart-empty">
          <h1 className="kala-cart-empty-title">YOUR CART IS EMPTY</h1>
          <p className="kala-cart-empty-desc">
            Explore the KALA collection and add something you love.
          </p>
          <Link to="/shop" className="kala-btn kala-btn-primary">
            CONTINUE SHOPPING
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="kala-container kala-cart-page">
      <header className="kala-cart-header">
        <h1 className="kala-h1" style={{ margin: 0 }}>
          CART
        </h1>
        <span className="kala-label" style={{ color: 'var(--kala-text-secondary)' }}>
          {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}
        </span>
      </header>

      <div className="kala-cart-layout">
        {/* Cart Line Items */}
        <div className="kala-cart-items-list" role="list">
          {cartItems.map((item) => {
            const itemSubtotal = item.price * item.quantity
            const itemKey = `${item.productId}-${item.size}-${item.customization?.frontText || ''}-${item.customization?.backText || ''}-${item.image || ''}`

            return (
              <div key={itemKey} className="kala-cart-item" role="listitem">
                <div className="kala-cart-item-img-wrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="kala-cart-item-img"
                  />
                </div>

                <div className="kala-cart-item-details">
                  <div className="kala-cart-item-top">
                    {item.productId.startsWith('custom-') ? (
                      <Link
                        to="/customize"
                        className="kala-cart-item-title"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <Link
                        to={`/product/${item.productId}`}
                        className="kala-cart-item-title"
                      >
                        {item.name}
                      </Link>
                    )}
                    <button
                      type="button"
                      className="kala-cart-item-remove-btn"
                      onClick={() => removeFromCart(item.productId, item.size, item.image, item.customization?.backText)}
                      aria-label={`Remove ${item.name} size ${item.size} from cart`}
                      title="Remove item"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ marginRight: '4px', flexShrink: 0 }}
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="kala-cart-item-size">
                    Size: <strong>{item.size}</strong>
                    {item.color && (
                      <span style={{ marginLeft: '0.75rem' }}>
                        Color: <strong>{item.color.toUpperCase()}</strong>
                      </span>
                    )}
                  </div>

                  {(item.customization?.frontText || item.customization?.backText) ? (
                    <div className="kala-cart-item-custom-box">
                      <span className="kala-cart-custom-badge">Custom Print Text: +₹25</span>
                      {item.customization.frontText && (
                        <div className="kala-cart-custom-row">
                          <span className="kala-cart-custom-label">Front:</span>
                          <strong className="kala-cart-custom-value">"{item.customization.frontText}"</strong>
                          {item.customization.frontFontSize && (
                            <span className="kala-cart-custom-size">({item.customization.frontFontSize}px)</span>
                          )}
                        </div>
                      )}
                      {item.customization.backText && (
                        <div className="kala-cart-custom-row">
                          <span className="kala-cart-custom-label">Back:</span>
                          <strong className="kala-cart-custom-value">"{item.customization.backText}"</strong>
                          {item.customization.backFontSize && (
                            <span className="kala-cart-custom-size">({item.customization.backFontSize}px)</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : item.customization?.position ? (
                    <div className="kala-cart-item-customization">
                      <span className="kala-cart-custom-label">Custom Print:</span>
                      <strong className="kala-cart-custom-value" style={{ textTransform: 'uppercase' }}>
                        {item.customization.position}
                      </strong>
                    </div>
                  ) : null}

                  <div className="kala-cart-item-price">
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>

                  <div className="kala-cart-item-bottom">
                    {/* Quantity Selector */}
                    <div className="kala-qty-controls" aria-label={`Quantity for ${item.name}`}>
                      <button
                        type="button"
                        className={`kala-qty-btn ${item.quantity === 1 ? 'kala-qty-btn-remove' : ''}`}
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity - 1, item.image, item.customization?.backText)
                        }
                        aria-label={item.quantity === 1 ? `Remove ${item.name} from cart` : 'Decrease quantity'}
                        title={item.quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="kala-qty-input kala-qty-value"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '')
                          if (val) {
                            updateQuantity(
                              item.productId,
                              item.size,
                              Math.max(1, parseInt(val, 10)),
                              item.image,
                              item.customization?.backText
                            )
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10)
                          if (!val || val < 1) {
                            updateQuantity(
                              item.productId,
                              item.size,
                              1,
                              item.image,
                              item.customization?.backText
                            )
                          }
                        }}
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <button
                        type="button"
                        className="kala-qty-btn"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity + 1, item.image, item.customization?.backText)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="kala-cart-subtotal-cell">
                      <span>Subtotal: </span>
                      <span>₹{itemSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary with Psychology Conversion Triggers */}
        <aside className="kala-cart-summary">
          {/* 1. Free Shipping Progress Goal Bar */}
          {(() => {
            const FREE_SHIPPING_THRESHOLD = 699
            const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal)
            const progressPercent = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100))
            const isUnlocked = amountNeeded === 0

            return (
              <div className="kala-cart-shipping-goal" role="status">
                <div className="kala-shipping-goal-header">
                  {isUnlocked ? (
                    <span className="kala-shipping-goal-text unlocked">
                      🎉 <strong>You unlocked FREE EXPRESS DELIVERY!</strong>
                    </span>
                  ) : (
                    <span className="kala-shipping-goal-text">
                      🚚 Add <strong>₹{amountNeeded.toLocaleString('en-IN')}</strong> more for <strong>FREE DELIVERY</strong>
                    </span>
                  )}
                  <span className="kala-shipping-goal-pct">{progressPercent}%</span>
                </div>
                <div className="kala-shipping-goal-track">
                  <div
                    className={`kala-shipping-goal-fill ${isUnlocked ? 'complete' : ''}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )
          })()}

          {/* 2. Cart Reservation Urgency Clock */}
          <div className="kala-cart-urgency-note">
            <span className="kala-cart-urgency-dot" aria-hidden="true" />
            <span className="kala-cart-urgency-text">
              High-demand items reserved in your cart for <strong>14:59</strong>
            </span>
          </div>

          <h2 className="kala-summary-title">ORDER SUMMARY</h2>

          <div className="kala-summary-row">
            <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
            <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="kala-summary-row">
            <span>Shipping</span>
            <span style={{ color: cartSubtotal >= 699 ? '#16a34a' : 'inherit', fontWeight: 600 }}>
              {cartSubtotal >= 699 ? 'FREE' : '₹50'}
            </span>
          </div>

          <div className="kala-summary-row total">
            <span>Total</span>
            <span>₹{(cartSubtotal >= 699 ? cartSubtotal : cartSubtotal + 50).toLocaleString('en-IN')}</span>
          </div>

          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="kala-btn kala-btn-primary kala-checkout-btn"
          >
            PROCEED TO CHECKOUT
          </button>

          {/* 3. Bank-Grade Trust & Payment Assurance */}
          <div className="kala-cart-trust-badges">
            <div className="kala-cart-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>256-Bit Encrypted Checkout</span>
            </div>
            <div className="kala-cart-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Dispatches in 24 Hours</span>
            </div>
            <div className="kala-cart-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>7-Day Easy Exchange Policy</span>
            </div>
            <div className="kala-cart-payment-methods">
              <span>UPI • Cards • NetBanking • COD</span>
            </div>
          </div>

          <Link to="/shop" className="kala-continue-link">
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </main>
  )
}

export default Cart
