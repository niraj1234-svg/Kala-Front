import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchOrderById, cancelOrderApi, requestReturnApi, type BackendOrder } from '../services/orderApi'
import { OrderTrackingTimeline } from '../components/orders/OrderTrackingTimeline'
import '../styles/OrderDetails.css'

export const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [order, setOrder] = useState<BackendOrder | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Order Actions State (Cancel / Return)
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false)
  const [cancelReason, setCancelReason] = useState<string>('Ordered by mistake')
  const [isCancelling, setIsCancelling] = useState<boolean>(false)

  const [showReturnModal, setShowReturnModal] = useState<boolean>(false)
  const [returnReason, setReturnReason] = useState<string>('Size does not fit')
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false)

  const loadOrder = useCallback(async () => {
    if (!orderId) return
    try {
      setErrorMessage(null)
      const data = await fetchOrderById(orderId)
      if (data) {
        setOrder(data)
      } else {
        setErrorMessage('Order not found.')
      }
    } catch (err: any) {
      if (err.status === 401) {
        setErrorMessage('Authentication required to view this order.')
      } else if (err.status === 403) {
        setErrorMessage('Access denied: This order belongs to another account.')
      } else if (err.status === 404) {
        setErrorMessage(`Order #${orderId} was not found.`)
      } else {
        setErrorMessage(err.message || 'Unable to retrieve order details. Please try again.')
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [orderId])

  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated && orderId) {
        loadOrder()
      } else if (!isAuthenticated) {
        setIsLoading(false)
      }
    }
  }, [orderId, isAuthenticated, isAuthLoading, loadOrder])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadOrder()
  }

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId) return
    setIsCancelling(true)
    setErrorMessage(null)
    setActionSuccess(null)
    try {
      const res = await cancelOrderApi(orderId, cancelReason)
      setActionSuccess(res.message || 'Order cancelled successfully. Product stock has been safely restored.')
      setShowCancelModal(false)
      loadOrder()
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleRequestReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId) return
    setIsSubmittingReturn(true)
    setErrorMessage(null)
    setActionSuccess(null)
    try {
      const res = await requestReturnApi(orderId, returnReason)
      setActionSuccess(res.message || 'Return request submitted. Our team will coordinate reverse pickup.')
      setShowReturnModal(false)
      loadOrder()
    } catch (err: any) {
      alert(err.message || 'Failed to submit return request.')
    } finally {
      setIsSubmittingReturn(false)
    }
  }

  const formatINR = (amt: number): string => `₹${Math.round(amt).toLocaleString('en-IN')}`

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const resolveImageUrl = (img?: string): string => {
    if (!img) return ''
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('/')) {
      return img
    }
    return `/${img}`
  }

  // --------------------------------------------------------------------------
  // RENDER: LOADING STATE
  // --------------------------------------------------------------------------
  if (isAuthLoading || isLoading) {
    return (
      <main className="kala-order-details-page">
        <div className="kala-order-details-container">
          <div className="kala-order-loading-box">
            <div className="kala-order-spinner" />
            <div className="kala-order-loading-text">Loading Order Details...</div>
          </div>
        </div>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: AUTHENTICATION REQUIRED
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <main className="kala-order-details-page">
        <div className="kala-order-details-container">
          <div className="kala-order-error-box">
            <div className="kala-order-error-icon">🔒</div>
            <h1 className="kala-order-error-title">Authentication Required</h1>
            <p className="kala-order-error-msg">
              Please sign in to your KALA account to view tracking and receipt details for this order.
            </p>
            <Link to={`/account?redirect=/account/orders/${orderId || ''}`} className="kala-btn kala-btn-primary">
              Sign In to View Order
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: ERROR / NOT FOUND
  // --------------------------------------------------------------------------
  if (errorMessage || !order) {
    return (
      <main className="kala-order-details-page">
        <div className="kala-order-details-container">
          <div className="kala-order-error-box">
            <div className="kala-order-error-icon">📦</div>
            <h1 className="kala-order-error-title">Unable to Find Order</h1>
            <p className="kala-order-error-msg">{errorMessage || 'The requested order could not be found.'}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/account" className="kala-btn kala-btn-primary">
                Back to My Orders
              </Link>
              <Link to="/shop" className="kala-btn kala-btn-secondary">
                Explore Shop
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // --------------------------------------------------------------------------
  // RENDER: ORDER DETAILS
  // --------------------------------------------------------------------------
  const normalizedStatus = (order.status || 'pending').toLowerCase()
  const isPaid = order.payment?.status === 'paid'
  const itemsCount = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0)

  const addressLine = order.shippingAddress?.address || ''
  const landmark = order.shippingAddress?.landmark
  const city = order.shippingAddress?.city || ''
  const state = order.shippingAddress?.state || ''
  const pincode = order.shippingAddress?.pincode || ''

  const subtotal = order.pricing?.subtotal || 0
  const discount = order.pricing?.discount || 0
  const total = order.pricing?.total || 0

  return (
    <main className="kala-order-details-page">
      <div className="kala-order-details-container">
        {/* Navigation Breadcrumb */}
        <nav className="kala-order-back-nav" aria-label="Order navigation">
          <Link to="/account" className="kala-order-back-link">
            <span>←</span>
            <span>Back to My Orders</span>
          </Link>
        </nav>

        {/* Top Header Bar */}
        <header className="kala-order-header-bar">
          <div className="kala-order-header-main">
            <h1 className="kala-order-ref-title">
              <span>Order</span>
              <span className="kala-order-id-highlight">#{order.orderId}</span>
            </h1>
            <div className="kala-order-meta-info">
              <span>Placed on {formatDate(order.createdAt)}</span>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <span>• Updated on {formatDate(order.updatedAt)}</span>
              )}
            </div>
          </div>

          <div className="kala-order-header-badges">
            <span className={`kala-badge kala-badge-status ${normalizedStatus}`}>
              Status: {normalizedStatus.replace(/_/g, ' ')}
            </span>
            <span
              className={`kala-badge ${
                isPaid ? 'kala-badge-payment-paid' : 'kala-badge-payment-pending'
              }`}
            >
              Payment: {isPaid ? 'Paid' : order.payment?.status || 'Pending'}
            </span>

            {/* Cancel Button if eligible */}
            {['pending', 'confirmed'].includes(normalizedStatus) && (
              <button
                type="button"
                className="kala-btn"
                style={{
                  background: 'transparent',
                  border: '1px solid #DC2626',
                  color: '#DC2626',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Order
              </button>
            )}

            {/* Request Return if delivered */}
            {normalizedStatus === 'delivered' && !(order as any).returnRequest && (
              <button
                type="button"
                className="kala-btn"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--kala-orange)',
                  color: 'var(--kala-orange)',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                onClick={() => setShowReturnModal(true)}
              >
                Request Return / Refund
              </button>
            )}
          </div>
        </header>

        {actionSuccess && (
          <div
            style={{
              background: '#D1FAE5',
              border: '1px solid #059669',
              color: '#065F46',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            ✓ {actionSuccess}
          </div>
        )}

        {(order as any).returnRequest && (
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #D97706',
              color: '#92400E',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.88rem',
            }}
          >
            <strong>Return Request Status:</strong> {(order as any).returnRequest.status.toUpperCase()} &mdash; Reason: "{(order as any).returnRequest.reason}"
          </div>
        )}

        {/* Live Fulfillment & Shipping Tracker */}
        <OrderTrackingTimeline
          order={order}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* 2-Column Responsive Layout */}
        <div className="kala-order-grid">
          {/* Main Column: Ordered Items List */}
          <div className="kala-order-col-main">
            <section className="kala-order-card" aria-labelledby="purchased-items-title">
              <div className="kala-order-card-header">
                <h2 id="purchased-items-title" className="kala-order-card-title">
                  <span>🛍️</span>
                  <span>Purchased Items</span>
                </h2>
                <span className="kala-order-card-count">
                  {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="kala-order-items-list">
                {(order.items || []).map((item, idx) => {
                  const itemImg = resolveImageUrl(item.image)
                  const unitPrice = item.price || 0
                  const itemQty = item.quantity || 1
                  const itemTotal = unitPrice * itemQty

                  return (
                    <article key={`${item.productId}-${idx}`} className="kala-order-item-row">
                      {itemImg ? (
                        <img
                          src={itemImg}
                          alt={item.name}
                          className="kala-order-item-thumb"
                          loading="lazy"
                        />
                      ) : (
                        <div className="kala-order-item-thumb-fallback">👕</div>
                      )}

                      <div className="kala-order-item-details">
                        <h3 className="kala-order-item-name">{item.name}</h3>

                        <div className="kala-order-item-meta-chips">
                          <span className="kala-item-chip">
                            Size: <strong>{item.size}</strong>
                          </span>
                          {item.color && (
                            <span className="kala-item-chip">
                              Color: <strong>{item.color}</strong>
                            </span>
                          )}
                          <span className="kala-item-chip">
                            Qty: <strong>{itemQty}</strong>
                          </span>
                        </div>

                        {/* Custom Print / Artwork Details if present */}
                        {(item.customization?.frontText ||
                          item.customization?.backText ||
                          item.customization?.position ||
                          item.customization?.requirementDetails) && (
                          <div className="kala-order-item-customization">
                            <span className="kala-custom-badge-tag">Custom Print Specification</span>
                            {item.customization.position && (
                              <div>
                                Print Position: <strong>{item.customization.position.toUpperCase()}</strong>
                              </div>
                            )}
                            {item.customization.frontText && (
                              <div>
                                Front Text: <strong>"{item.customization.frontText}"</strong>
                              </div>
                            )}
                            {item.customization.backText && (
                              <div>
                                Back Text: <strong>"{item.customization.backText}"</strong>
                              </div>
                            )}
                            {item.customization.requirementDetails && (
                              <div>
                                Note: <em>{item.customization.requirementDetails}</em>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="kala-order-item-pricing">
                        <div className="kala-item-unit-price">{formatINR(unitPrice)} each</div>
                        <div className="kala-item-total-price">{formatINR(itemTotal)}</div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Side Column: Shipping Details & Price Summary */}
          <aside className="kala-order-col-side">
            {/* Delivery Address Card */}
            <section className="kala-order-card" aria-labelledby="shipping-address-title">
              <div className="kala-order-card-header">
                <h2 id="shipping-address-title" className="kala-order-card-title">
                  <span>📍</span>
                  <span>Delivery Address</span>
                </h2>
              </div>

              <div className="kala-address-block">
                <div className="kala-address-name">
                  {order.customerName ||
                    `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() ||
                    'Customer'}
                </div>
                <div className="kala-address-line">{addressLine}</div>
                {landmark && <div className="kala-address-line" style={{ color: '#6b7280' }}>Landmark: {landmark}</div>}
                <div className="kala-address-line">
                  {city}, {state} - <strong>{pincode}</strong>
                </div>
                <div className="kala-address-line">India</div>

                <div className="kala-address-contact">
                  {order.customer?.phone && (
                    <div className="kala-address-contact-item">
                      <span>📞</span>
                      <span>+91 {order.customer.phone}</span>
                    </div>
                  )}
                  {order.customer?.email && (
                    <div className="kala-address-contact-item">
                      <span>✉️</span>
                      <span>{order.customer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Price Summary Card */}
            <section className="kala-order-card" aria-labelledby="price-summary-title">
              <div className="kala-order-card-header">
                <h2 id="price-summary-title" className="kala-order-card-title">
                  <span>💳</span>
                  <span>Price Summary</span>
                </h2>
              </div>

              <div className="kala-price-breakdown">
                <div className="kala-price-row">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="kala-price-row discount">
                    <span>Discount {order.coupon?.code ? `(${order.coupon.code})` : ''}</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}

                <div className="kala-price-row">
                  <span>Shipping</span>
                  <span className="kala-shipping-free-pill">FREE</span>
                </div>

                <div className="kala-price-divider" />

                <div className="kala-price-row grand-total">
                  <span>Total Amount</span>
                  <span className="kala-total-val">{formatINR(total)}</span>
                </div>

                {order.payment?.method && (
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.4rem' }}>
                    Paid via: <strong style={{ color: '#111111' }}>{order.payment.method.toUpperCase()}</strong>
                  </div>
                )}
              </div>
            </section>

            {/* Need Help Card */}
            <section className="kala-support-card">
              <div className="kala-support-title">Need help with this order?</div>
              <div className="kala-support-desc">
                If you have questions about sizing, delivery, or custom print artwork, our support team is available.
              </div>
              <div className="kala-support-actions">
                <a
                  href="mailto:support@kala.com?subject=Inquiry%20regarding%20Order%20"
                  className="kala-support-btn"
                >
                  ✉️ Email Support
                </a>
                <Link to="/shop" className="kala-support-btn">
                  🛍️ Shop More
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* CANCEL ORDER CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="vendor-modal-backdrop" onClick={() => setShowCancelModal(false)}>
          <div className="vendor-modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="vendor-modal-header">
              <h2>Cancel Order #{order.orderId}</h2>
              <button
                type="button"
                className="vendor-modal-close-btn"
                onClick={() => setShowCancelModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCancelOrder}>
              <div className="vendor-modal-body">
                <p style={{ fontSize: '0.9rem', color: '#5F6368', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Are you sure you want to cancel this order? Once cancelled, items will be safely returned to stock and order fulfillment will be stopped.
                </p>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">Reason for Cancellation</label>
                  <select
                    className="vendor-form-select"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  >
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Found a better price">Found a better price</option>
                    <option value="Need to change shipping address">Need to change shipping address</option>
                    <option value="Delivery time is too long">Delivery time is too long</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="vendor-modal-footer">
                <button
                  type="button"
                  className="btn-action-sm"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  className="btn-action-sm btn-action-delete"
                  style={{ padding: '0.6rem 1.25rem', background: '#DC2626', color: '#FFF' }}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST RETURN MODAL */}
      {showReturnModal && (
        <div className="vendor-modal-backdrop" onClick={() => setShowReturnModal(false)}>
          <div className="vendor-modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="vendor-modal-header">
              <h2>Request Return / Refund</h2>
              <button
                type="button"
                className="vendor-modal-close-btn"
                onClick={() => setShowReturnModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleRequestReturn}>
              <div className="vendor-modal-body">
                <p style={{ fontSize: '0.9rem', color: '#5F6368', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Please share why you would like to return this order. KALA marketplace guarantees a hassle-free return for unworn items within 7 days.
                </p>

                <div className="vendor-form-group">
                  <label className="vendor-form-label">Return Reason</label>
                  <select
                    className="vendor-form-select"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                  >
                    <option value="Size does not fit">Size does not fit</option>
                    <option value="Item received defective or damaged">Item received defective or damaged</option>
                    <option value="Item does not match website description">Item does not match website description</option>
                    <option value="Quality not as expected">Quality not as expected</option>
                    <option value="Wrong item received">Wrong item received</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="vendor-modal-footer">
                <button
                  type="button"
                  className="btn-action-sm"
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="marketplace-btn-primary"
                  disabled={isSubmittingReturn}
                >
                  {isSubmittingReturn ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default OrderDetails
