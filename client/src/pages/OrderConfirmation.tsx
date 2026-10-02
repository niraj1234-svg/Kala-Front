import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchOrderById } from '../services/orderApi'
import type { BackendOrder } from '../services/orderApi'
import { getOrderById as getLocalOrderById } from '../types/order'
import { getProductImage } from '../data/products'
import '../styles/OrderConfirmation.css'

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<BackendOrder | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    // 1. Fetch from live Express / MongoDB Atlas API
    fetchOrderById(orderId)
      .then((liveOrder) => {
        if (!isMounted) return
        if (liveOrder) {
          setOrder(liveOrder)
        } else {
          // 2. Fallback to local cache for backward compatibility
          const local = getLocalOrderById(orderId)
          if (local) {
            setOrder({
              orderId: local.orderId,
              customer: local.customer,
              shippingAddress: {
                address: [local.shippingAddress.addressLine1, local.shippingAddress.addressLine2].filter(Boolean).join(', '),
                city: local.shippingAddress.city,
                state: local.shippingAddress.state,
                pincode: local.shippingAddress.pinCode,
              },
              items: local.items.map((i) => ({
                productId: i.productId,
                name: i.name,
                image: i.image,
                size: i.size,
                quantity: i.quantity,
                price: i.price,
                customization: i.customization,
              })),
              pricing: {
                subtotal: local.subtotal,
                shipping: local.shipping,
                total: local.total,
              },
              status: local.status,
              createdAt: local.createdAt,
            })
          }
        }
      })
      .catch((err) => {
        console.warn('[OrderConfirmation] API fetch error, checking local storage:', err)
        if (isMounted) {
          const local = getLocalOrderById(orderId)
          if (local) {
            setOrder({
              orderId: local.orderId,
              customer: local.customer,
              shippingAddress: {
                address: [local.shippingAddress.addressLine1, local.shippingAddress.addressLine2].filter(Boolean).join(', '),
                city: local.shippingAddress.city,
                state: local.shippingAddress.state,
                pincode: local.shippingAddress.pinCode,
              },
              items: local.items.map((i) => ({
                productId: i.productId,
                name: i.name,
                image: i.image,
                size: i.size,
                quantity: i.quantity,
                price: i.price,
              })),
              pricing: {
                subtotal: local.subtotal,
                shipping: local.shipping,
                total: local.total,
              },
              status: local.status,
              createdAt: local.createdAt,
            })
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [orderId])

  // Loading State
  if (isLoading) {
    return (
      <main className="kala-container kala-confirmation-page">
        <div className="kala-confirmation-card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <p className="kala-label" style={{ color: 'var(--kala-orange)', marginBottom: '1rem' }}>
            VERIFYING ORDER WITH MONGODB...
          </p>
          <h1 className="kala-h2" style={{ marginBottom: '1rem' }}>
            LOADING YOUR ORDER
          </h1>
          <p className="kala-body" style={{ color: 'var(--kala-text-secondary)' }}>
            Please wait while we retrieve your order confirmation details.
          </p>
        </div>
      </main>
    )
  }

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
            The order you are looking for does not exist in our system.
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

  // Normalize image paths for display
  const resolveItemImage = (img: string) => {
    let clean = img || ''
    if (clean.startsWith('/images/')) {
      clean = clean.replace('/images/', '')
    }
    return getProductImage(clean)
  }

  const subtotal = order.pricing?.subtotal ?? 0
  const shipping = order.pricing?.shipping ?? 0
  const total = order.pricing?.total ?? 0

  return (
    <main className="kala-container kala-confirmation-page">
      <div className="kala-confirmation-card">
        {/* Header */}
        <header className="kala-confirmation-header">
          <div className="kala-confirmation-check" aria-hidden="true">
            {order.status === 'pending' ? '⏳' : '✓'}
          </div>
          <p className="kala-label kala-confirmation-badge">
            {order.status === 'pending' ? 'PAYMENT PENDING' : 'PURCHASE COMPLETE'}
          </p>
          <h1 className="kala-confirmation-title">
            {order.status === 'pending' ? 'ORDER PLACED - PAYMENT PENDING' : 'ORDER CONFIRMED'}
          </h1>
          <p className="kala-confirmation-subtitle">
            {order.status === 'pending'
              ? 'Thank you for your order. Your order details have been saved, but payment is still pending.'
              : 'Thank you for your order. We have received your request and are preparing it for shipment.'}
          </p>
          <div className="kala-order-id-box">
            ORDER ID: <strong>{order.orderId}</strong>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--kala-text-secondary)' }}>
            Placed on {formattedDate} · Status:{' '}
            <strong style={{ textTransform: 'uppercase', color: order.status === 'pending' ? '#b45309' : 'var(--kala-black)' }}>
              {order.status || 'pending'}
            </strong>
            {order.payment?.razorpayPaymentId && (
              <span> · Payment ID: <strong>{order.payment.razorpayPaymentId}</strong></span>
            )}
          </div>
        </header>

        {/* Bundle Event Highlight */}
        {order.bundle && (
          <div
            className="kala-confirmation-bundle-banner"
            style={{
              background: '#FFF8F3',
              border: '1.5px solid #D94700',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              marginBottom: '1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#D94700',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.2rem',
                }}
              >
                SPECIAL EVENT BUNDLE
              </span>
              <strong style={{ fontSize: '1.15rem', color: '#111111', textTransform: 'uppercase' }}>
                {order.bundle.name} ({order.bundle.slotCount} T-Shirts)
              </strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: '#777782', display: 'block', fontWeight: 700 }}>
                BUNDLE PRICE
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#D94700' }}>
                ₹{order.bundle.price}
              </span>
            </div>
          </div>
        )}

        {/* Customer & Shipping Details */}
        <div className="kala-order-info-grid">
          <div className="kala-order-info-block">
            <h2 className="kala-order-info-title">CUSTOMER INFORMATION</h2>
            <div className="kala-order-info-text">
              <p>
                <strong>
                  {order.customer.firstName} {order.customer.lastName}
                </strong>
              </p>
              <p>{order.customer.email}</p>
              <p>{order.customer.phone}</p>
            </div>
          </div>

          <div className="kala-order-info-block">
            <h2 className="kala-order-info-title">SHIPPING & DELIVERY</h2>
            <div className="kala-order-info-text">
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p>India</p>
              <div style={{ marginTop: '0.65rem', padding: '0.45rem 0.75rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.8rem' }}>
                <span style={{ color: '#4B5563' }}>Estimated Delivery: </span>
                <strong style={{ color: '#111111' }}>3–5 Business Days</strong>
              </div>
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
                  src={resolveItemImage(item.image)}
                  alt={item.name}
                  className="kala-order-item-img"
                />
                <div className="kala-order-item-desc">
                  <div className="kala-order-item-name">{item.name}</div>
                  <div className="kala-order-item-meta">
                    Size: <strong>{item.size}</strong> · Qty: {item.quantity} · ₹{item.price.toLocaleString('en-IN')} each
                  </div>
                  {item.customization?.frontText && (
                    <div className="kala-order-item-custom-text" style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#1e3d2f', fontWeight: 600 }}>
                      Front Text: "{item.customization.frontText}"
                    </div>
                  )}
                  {item.customization?.backText && (
                    <div className="kala-order-item-custom-text" style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#1e3d2f', fontWeight: 600 }}>
                      Back Text: "{item.customization.backText}" {!item.customization?.frontText && '(+₹25)'}
                    </div>
                  )}
                  {item.customization?.position && (
                    <div style={{ marginTop: '0.2rem', fontSize: '0.75rem', color: 'var(--kala-orange)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {item.customization.position} Print
                    </div>
                  )}
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
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="kala-order-total-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
          </div>
          <div className="kala-order-total-row grand-total">
            <span>{order.status === 'pending' ? 'Total Due' : 'Total Paid'}</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Footer Action */}
        <footer className="kala-confirmation-footer" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {order.status === 'pending' && (
            <Link to="/checkout" className="kala-btn kala-btn-primary kala-confirmation-shop-btn">
              RETURN TO CHECKOUT TO PAY
            </Link>
          )}
          <Link to={`/account/orders/${order.orderId}`} className="kala-btn kala-btn-secondary kala-confirmation-shop-btn">
            TRACK ORDER
          </Link>
          <Link to="/shop" className="kala-btn kala-btn-primary kala-confirmation-shop-btn">
            CONTINUE SHOPPING
          </Link>
        </footer>
      </div>
    </main>
  )
}

export default OrderConfirmation
