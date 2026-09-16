import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchOrderById } from '../services/orderApi'
import type { BackendOrder } from '../services/orderApi'
import '../styles/OrderConfirmation.css'

export const AccountOrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const { currentUser, isAuthenticated, isLoading } = useAuth()

  const [order, setOrder] = useState<BackendOrder | null>(null)
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(true)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // 1. Wait for session hydration to complete
    if (isLoading) {
      return
    }

    // 2. If user is unauthenticated, reject immediately without making API call
    if (!isAuthenticated || !currentUser) {
      setStatusCode(401)
      setIsLoadingOrder(false)
      return
    }

    // 3. Validate presence of orderId parameter
    if (!orderId) {
      setStatusCode(404)
      setIsLoadingOrder(false)
      return
    }

    let isMounted = true
    setIsLoadingOrder(true)
    setStatusCode(null)
    setErrorMessage(null)

    // 4. Fetch authenticated order from backend MongoDB API
    fetchOrderById(orderId)
      .then((data) => {
        if (!isMounted) return
        if (data) {
          setOrder(data)
        } else {
          setStatusCode(404)
        }
      })
      .catch((err: any) => {
        if (!isMounted) return
        if (err.status === 401) {
          setStatusCode(401)
        } else if (err.status === 403) {
          setStatusCode(403)
        } else if (err.status === 404) {
          setStatusCode(404)
        } else {
          setErrorMessage(err.message || 'Unable to retrieve order details. Please try again.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingOrder(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [orderId, isAuthenticated, currentUser, isLoading])

  // --------------------------------------------------------------------------
  // RENDER: LOADING STATE
  // --------------------------------------------------------------------------
  if (isLoading || isLoadingOrder) {
    return (
      <main className="kala-container kala-confirmation-page">
        <div className="kala-confirmation-card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', letterSpacing: '0.1em' }}>
            LOADING ORDER...
          </p>
        </div>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: 401 UNAUTHORIZED STATE
  // --------------------------------------------------------------------------
  if (statusCode === 401 || !isAuthenticated || !currentUser) {
    return (
      <main className="kala-container kala-confirmation-page">
        <div className="kala-confirmation-card" style={{ textAlign: 'center' }}>
          <p className="kala-display" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
            401
          </p>
          <h1 className="kala-h2" style={{ marginBottom: '1rem' }}>
            AUTHENTICATION REQUIRED
          </h1>
          <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', marginBottom: '2rem' }}>
            Please log in to your KALA account to view this order receipt.
          </p>
          <Link to="/account" className="kala-btn kala-btn-primary">
            GO TO LOGIN
          </Link>
        </div>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: 403 FORBIDDEN STATE (CROSS-CUSTOMER ACCESS BLOCKED BY SERVER)
  // --------------------------------------------------------------------------
  if (statusCode === 403) {
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
            This order cannot be found in your account or belongs to another customer.
          </p>
          <Link to="/account" className="kala-btn kala-btn-primary">
            BACK TO MY ORDERS
          </Link>
        </div>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: 404 NOT FOUND STATE
  // --------------------------------------------------------------------------
  if (statusCode === 404 || !order) {
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
            The order you requested does not exist or may have been removed.
          </p>
          <Link to="/account" className="kala-btn kala-btn-primary">
            BACK TO MY ORDERS
          </Link>
        </div>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: GENERIC ERROR STATE
  // --------------------------------------------------------------------------
  if (errorMessage) {
    return (
      <main className="kala-container kala-confirmation-page">
        <div className="kala-confirmation-card" style={{ textAlign: 'center' }}>
          <h1 className="kala-h2" style={{ marginBottom: '1rem' }}>
            UNABLE TO LOAD ORDER
          </h1>
          <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', marginBottom: '2rem' }}>
            {errorMessage}
          </p>
          <Link to="/account" className="kala-btn kala-btn-primary">
            BACK TO MY ORDERS
          </Link>
        </div>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: AUTHORIZED ORDER RECEIPT (DATA FROM MONGODB)
  // --------------------------------------------------------------------------
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const addressLine = order.shippingAddress.address || (order.shippingAddress as any).addressLine1 || ''
  const addressLine2 = (order.shippingAddress as any).addressLine2
  const city = order.shippingAddress.city
  const state = order.shippingAddress.state
  const pincode = order.shippingAddress.pincode || (order.shippingAddress as any).pinCode

  const subtotal = order.pricing?.subtotal ?? 0
  const shipping = order.pricing?.shipping ?? 0
  const total = order.pricing?.total ?? 0

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
            Placed on {formattedDate} · Status:{' '}
            <strong style={{ color: '#059669' }}>
              {order.status === 'confirmed' ? 'Order Placed' : order.status}
            </strong>
          </div>
        </header>

        {/* Customer and Shipping Details */}
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
              <p>+91 {order.customer.phone}</p>
            </div>
          </div>

          <div className="kala-order-info-block">
            <h2 className="kala-order-info-title">SHIPPING ADDRESS</h2>
            <div className="kala-order-info-text">
              <p>{addressLine}</p>
              {addressLine2 && <p>{addressLine2}</p>}
              <p>
                {city}, {state} - {pincode}
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
                    Size: <strong>{item.size}</strong> · Qty: {item.quantity} · ₹
                    {item.price.toLocaleString('en-IN')} each
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
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="kala-order-total-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
          </div>
          <div className="kala-order-total-row grand-total">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
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
