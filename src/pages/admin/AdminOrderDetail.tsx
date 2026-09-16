import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  fetchAdminOrderById,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
  type AdminOrder,
  type AdminOrderStatus,
} from '../../services/adminApi'
import '../../styles/Admin.css'

const STATUS_OPTIONS: AdminOrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export const AdminOrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Status form state
  const [selectedStatus, setSelectedStatus] = useState<AdminOrderStatus>('pending')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Tracking form state
  const [trackingNumber, setTrackingNumber] = useState<string>('')
  const [carrier, setCarrier] = useState<string>('')
  const [isUpdatingTracking, setIsUpdatingTracking] = useState<boolean>(false)
  const [trackingFeedback, setTrackingFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const loadOrder = useCallback(async () => {
    if (!orderId) return
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await fetchAdminOrderById(orderId)
      setOrder(data.order)
      setSelectedStatus(data.order.status)
      setTrackingNumber(data.order.tracking?.trackingNumber || '')
      setCarrier(data.order.tracking?.carrier || '')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve order details.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return
    setIsUpdatingStatus(true)
    setStatusFeedback(null)

    try {
      const result = await updateAdminOrderStatus(order.orderId, selectedStatus)
      setOrder(result.order)
      setStatusFeedback({ type: 'success', message: 'Order status updated successfully.' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update order status.'
      setStatusFeedback({ type: 'error', message: msg })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return
    setIsUpdatingTracking(true)
    setTrackingFeedback(null)

    try {
      const result = await updateAdminOrderTracking(order.orderId, {
        trackingNumber,
        carrier,
      })
      setOrder(result.order)
      setTrackingFeedback({ type: 'success', message: 'Tracking details updated successfully.' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update tracking details.'
      setTrackingFeedback({ type: 'error', message: msg })
    } finally {
      setIsUpdatingTracking(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadgeClass = (status: AdminOrderStatus) => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return 'status-badge status-success'
      case 'processing':
      case 'shipped':
        return 'status-badge status-info'
      case 'cancelled':
        return 'status-badge status-danger'
      default:
        return 'status-badge status-warning'
    }
  }

  if (isLoading) {
    return (
      <div className="admin-page-container">
        <div className="admin-state-container" role="status">
          <div className="admin-spinner" />
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (errorMessage || !order) {
    return (
      <div className="admin-page-container">
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage || 'Order not found.'}</p>
          <div className="admin-btn-group">
            <button type="button" className="admin-btn admin-btn-primary" onClick={loadOrder}>
              Retry
            </button>
            <Link to="/admin/orders" className="admin-btn admin-btn-secondary">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page-container">
      {/* Top Breadcrumb / Back Link */}
      <div className="admin-detail-breadcrumb">
        <Link to="/admin/orders" className="admin-back-link">
          ← Back to Orders List
        </Link>
      </div>

      {/* Header with Order ID & Status */}
      <header className="admin-detail-header">
        <div>
          <div className="admin-detail-title-row">
            <h1 className="admin-page-title">Order {order.orderId}</h1>
            <span className={getStatusBadgeClass(order.status)}>
              {order.status.toUpperCase()}
            </span>
          </div>
          <p className="admin-page-subtitle">
            Placed on {formatDate(order.createdAt)} • Customer ID:{' '}
            <span className="font-mono">{order.userId || 'Guest Order'}</span>
          </p>
        </div>
      </header>

      {/* Main Grid: Details on Left, Actions on Right */}
      <div className="admin-detail-grid">
        {/* Left Column: Line Items + Addresses + Totals */}
        <div className="admin-detail-main">
          {/* Items Table */}
          <div className="admin-card-section">
            <h2 className="admin-section-title">Purchased Items ({order.items.length})</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item Details</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={`${item.productId}-${item.size}-${idx}`}>
                      <td>
                        <div className="admin-item-cell">
                          {item.image && (
                            <img
                              src={`/assets/${item.image}`}
                              alt={item.name}
                              className="admin-item-thumb"
                              onError={(e) => {
                                ;(e.currentTarget as HTMLElement).style.display = 'none'
                              }}
                            />
                          )}
                          <div className="admin-item-info">
                            <span className="item-name font-medium text-white">{item.name}</span>
                            <span className="item-id font-mono text-muted">{item.productId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono">{item.size}</td>
                      <td>{formatPrice(item.price)}</td>
                      <td className="font-medium">{item.quantity}</td>
                      <td className="text-right font-medium text-white">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pricing Summary Breakdown */}
            <div className="admin-pricing-breakdown">
              <div className="pricing-row">
                <span className="text-muted">Items Subtotal</span>
                <span className="font-medium">{formatPrice(order.pricing.subtotal)}</span>
              </div>
              <div className="pricing-row">
                <span className="text-muted">Standard Express Shipping</span>
                <span className="font-medium">{formatPrice(order.pricing.shipping)}</span>
              </div>
              <div className="pricing-row pricing-total">
                <span className="text-white font-bold">Total Amount Paid</span>
                <span className="text-white font-bold text-lg">
                  {formatPrice(order.pricing.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Address Info */}
          <div className="admin-info-columns">
            <div className="admin-card-section">
              <h3 className="admin-section-title">Customer Information</h3>
              <div className="admin-kv-list">
                <div className="kv-row">
                  <span className="kv-label">Name</span>
                  <span className="kv-val font-medium text-white">
                    {order.customer.firstName} {order.customer.lastName}
                  </span>
                </div>
                <div className="kv-row">
                  <span className="kv-label">Email</span>
                  <span className="kv-val font-mono">{order.customer.email}</span>
                </div>
                <div className="kv-row">
                  <span className="kv-label">Phone</span>
                  <span className="kv-val font-mono">{order.customer.phone}</span>
                </div>
              </div>
            </div>

            <div className="admin-card-section">
              <h3 className="admin-section-title">Shipping Address</h3>
              <div className="admin-address-block">
                <p className="font-medium text-white">{order.shippingAddress.address}</p>
                <p className="text-muted">
                  {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
                  <span className="font-mono">{order.shippingAddress.pincode}</span>
                </p>
                <p className="text-muted">India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Administrative Actions & Controls */}
        <aside className="admin-detail-sidebar">
          {/* Order Lifecycle Status Update Form */}
          <div className="admin-card-section">
            <h3 className="admin-section-title">Update Order Status</h3>
            {statusFeedback && (
              <div
                className={`admin-feedback-alert ${
                  statusFeedback.type === 'success' ? 'feedback-success' : 'feedback-error'
                }`}
                role="alert"
              >
                {statusFeedback.message}
              </div>
            )}
            <form onSubmit={handleStatusSubmit} className="admin-action-form">
              <div className="admin-form-group">
                <label htmlFor="order-status-select" className="admin-form-label">
                  Fulfillment Status
                </label>
                <select
                  id="order-status-select"
                  className="admin-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as AdminOrderStatus)}
                  disabled={isUpdatingStatus}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="admin-btn admin-btn-primary full-width"
                disabled={isUpdatingStatus || selectedStatus === order.status}
              >
                {isUpdatingStatus ? 'Updating Status...' : 'Save Status'}
              </button>
            </form>
          </div>

          {/* Logistics & Courier Tracking Form */}
          <div className="admin-card-section">
            <h3 className="admin-section-title">Logistics & Tracking</h3>
            {trackingFeedback && (
              <div
                className={`admin-feedback-alert ${
                  trackingFeedback.type === 'success' ? 'feedback-success' : 'feedback-error'
                }`}
                role="alert"
              >
                {trackingFeedback.message}
              </div>
            )}
            <form onSubmit={handleTrackingSubmit} className="admin-action-form">
              <div className="admin-form-group">
                <label htmlFor="carrier-input" className="admin-form-label">
                  Shipping Carrier
                </label>
                <input
                  id="carrier-input"
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. BlueDart, Delhivery, DTDC"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  disabled={isUpdatingTracking}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="tracking-input" className="admin-form-label">
                  Tracking Number / AWB
                </label>
                <input
                  id="tracking-input"
                  type="text"
                  className="admin-form-input font-mono"
                  placeholder="e.g. BLD123456789"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  disabled={isUpdatingTracking}
                />
              </div>

              {order.tracking?.updatedAt && (
                <p className="admin-tracking-meta text-muted">
                  Last updated: {formatDate(order.tracking.updatedAt)}
                </p>
              )}

              <button
                type="submit"
                className="admin-btn admin-btn-secondary full-width"
                disabled={isUpdatingTracking}
              >
                {isUpdatingTracking ? 'Saving Tracking...' : 'Save Tracking'}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default AdminOrderDetail
