import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrderById } from '../types/order'
import '../styles/OrderConfirmation.css'

export const AccountOrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const { currentUser, isAuthenticated } = useAuth()

  const order = orderId ? getOrderById(orderId) : undefined

  // Security / Ownership Check:
  // If not authenticated, or order doesn't exist, or doesn't belong to current user's email:
  const isAuthorized =
    isAuthenticated &&
    currentUser &&
    order &&
    order.customer.email.toLowerCase() === currentUser.email.toLowerCase()

  if (!isAuthorized || !order) {
    return (
      <main className="kala-container kala-confirmation-page">
        <div className="kala-confirmation-card" style={{ textAlign: 'center' }}>
          <p className="kala-display" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
            403
          </p>
          <h1 className="kala-h2" style={{ marginBottom: '1rem' }}>
            YOU DON'T HAVE ACCESS TO THIS ORDER
          </h1>
          <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', marginBottom: '2rem' }}>
            This order cannot be found in your account or requires you to log in with the correct credentials.
          </p>
          <Link to="/account" className="kala-btn kala-btn-primary">
            BACK TO MY ORDERS
          </Link>
        </div>
      </main>
    )
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="kala-container kala-confirmation-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/account"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8125rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--kala-text-secondary)',
            textDecoration: 'none',
          }}
        >
          ← BACK TO MY ORDERS
        </Link>
      </div>

      <div className="kala-confirmation-card">
        <header className="kala-confirmation-header">
          <p className="kala-label kala-confirmation-badge">ORDER RECEIPT</p>
          <h1 className="kala-confirmation-title">ORDER DETAILS</h1>
          <div className="kala-order-id-box">
            ORDER ID: <strong>{order.orderId}</strong>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--kala-text-secondary)' }}>
            Placed on {formattedDate} · Status: <strong style={{ color: '#059669' }}>{order.status === 'confirmed' ? 'Order Placed' : order.status}</strong>
          </div>
        </header>

        {/* Customer and Shipping Details */}
        <div className="kala-order-info-grid">
          <div className="kala-order-info-block">
            <h2 className="kala-order-info-title">CUSTOMER INFORMATION</h2>
            <div className="kala-order-info-text">
              <p><strong>{order.customer.firstName} {order.customer.lastName}</strong></p>
              <p>{order.customer.email}</p>
              <p>+91 {order.customer.phone}</p>
            </div>
          </div>

          <div className="kala-order-info-block">
            <h2 className="kala-order-info-title">SHIPPING ADDRESS</h2>
            <div className="kala-order-info-text">
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}
              </p>
              <p>India</p>
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        <section className="kala-order-items-section" aria-label="Purchased items">
          <h2 className="kala-order-items-title">ITEMS ({order.items.length})</h2>
          <div className="kala-order-items-list" role="list">
            {order.items.map((item, index) => (
              <div
                key={`${item.productId}-${item.size}-${index}`}
                className="kala-order-item-row"
                role="listitem"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="kala-order-item-img"
                />
                <div className="kala-order-item-desc">
                  <div className="kala-order-item-name">{item.name}</div>
                  <div className="kala-order-item-meta">
                    Size: <strong>{item.size}</strong> · Qty: {item.quantity} · ₹{item.price.toLocaleString('en-IN')} each
                  </div>
                </div>
                <div className="kala-order-item-total">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Summary */}
        <div className="kala-order-totals">
          <div className="kala-order-total-row">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="kala-order-total-row">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
          </div>
          <div className="kala-order-total-row grand-total">
            <span>Total</span>
            <span>₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <footer className="kala-confirmation-footer">
          <Link to="/account" className="kala-btn kala-btn-secondary">
            BACK TO MY ORDERS
          </Link>
        </footer>
      </div>
    </main>
  )
}

export default AccountOrderDetail
