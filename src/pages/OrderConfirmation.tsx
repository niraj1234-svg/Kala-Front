import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrderById } from '../types/order'
import '../styles/OrderConfirmation.css'

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const order = orderId ? getOrderById(orderId) : undefined

  // 1. ORDER NOT FOUND STATE
  if (!order) {
    return (
      <main className="kala-container kala-confirmation-page">
        <div className="kala-confirmation-card" style={{ textAlign: 'center' }}>
          <p className="kala-display" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
            404
          </p>
          <h1 className="kala-h2" style={{ marginBottom: '1rem' }}>
            ORDER NOT FOUND
          </h1>
          <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', marginBottom: '2rem' }}>
            The order you are looking for does not exist or has expired.
          </p>
          <Link to="/shop" className="kala-btn kala-btn-primary">
            RETURN TO SHOP
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
      <div className="kala-confirmation-card">
        {/* Header */}
        <header className="kala-confirmation-header">
          <div className="kala-confirmation-check" aria-hidden="true">
            ✓
          </div>
          <p className="kala-label kala-confirmation-badge">PURCHASE COMPLETE</p>
          <h1 className="kala-confirmation-title">ORDER CONFIRMED</h1>
          <p className="kala-confirmation-subtitle">
            Thank you for your order. We have received your request and are preparing it for shipment.
          </p>
          <div className="kala-order-id-box">
            ORDER ID: <strong>{order.orderId}</strong>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--kala-text-secondary)' }}>
            Placed on {formattedDate}
          </div>
        </header>

        {/* Customer & Shipping Details */}
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

        {/* Ordered Products Section */}
        <section className="kala-order-items-section" aria-label="Purchased items">
          <h2 className="kala-order-items-title">ORDERED ITEMS ({order.items.length})</h2>
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

        {/* Totals Summary */}
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
            <span>Total Paid</span>
            <span>₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Footer Action */}
        <footer className="kala-confirmation-footer">
          <Link to="/shop" className="kala-btn kala-btn-primary kala-confirmation-shop-btn">
            CONTINUE SHOPPING
          </Link>
        </footer>
      </div>
    </main>
  )
}

export default OrderConfirmation
