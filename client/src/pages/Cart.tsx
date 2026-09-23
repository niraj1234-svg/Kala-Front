import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import '../styles/Cart.css'

export const Cart: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { cartItems, cartCount, cartSubtotal, removeFromCart, updateQuantity } = useCart()

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/account?redirect=/checkout&message=Please%20log%20in%20to%20continue%20with%20your%20purchase.')
      return
    }
    navigate('/checkout')
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
            const itemKey = `${item.productId}-${item.size}-${item.image || ''}`

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
                    <Link
                      to={`/product/${item.productId}`}
                      className="kala-cart-item-title"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      className="kala-cart-item-remove-btn"
                      onClick={() => removeFromCart(item.productId, item.size, item.image)}
                      aria-label={`Remove ${item.name} size ${item.size} from cart`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="kala-cart-item-size">
                    Size: <strong>{item.size}</strong>
                  </div>

                  <div className="kala-cart-item-price">
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>

                  <div className="kala-cart-item-bottom">
                    {/* Quantity Selector */}
                    <div className="kala-qty-controls" aria-label={`Quantity for ${item.name}`}>
                      <button
                        type="button"
                        className="kala-qty-btn"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity - 1, item.image)
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="kala-qty-value" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="kala-qty-btn"
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity + 1, item.image)
                        }
                        disabled={item.quantity >= 10}
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

        {/* Order Summary */}
        <aside className="kala-cart-summary">
          <h2 className="kala-summary-title">ORDER SUMMARY</h2>

          <div className="kala-summary-row">
            <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
            <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="kala-summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="kala-summary-row total">
            <span>Total</span>
            <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="kala-btn kala-btn-primary kala-checkout-btn"
          >
            PROCEED TO CHECKOUT
          </button>

          <Link to="/shop" className="kala-continue-link">
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </main>
  )
}

export default Cart
