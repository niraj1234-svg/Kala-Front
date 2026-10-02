import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
  type AdminOrderStatus,
} from '../../services/adminApi'
import '../../styles/Admin.css'

const STATUS_OPTIONS: { value: AdminOrderStatus; label: string }[] = [
  { value: 'confirmed', label: 'Order Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(15)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Status Change Confirmation Modal State
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    order: AdminOrder
    newStatus: AdminOrderStatus
    newStatusLabel: string
  } | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await fetchAdminOrders({
        page,
        limit,
        status: statusFilter,
        search: searchTerm,
      })
      setOrders(data.orders)
      setTotalPages(data.pagination.pages)
      setTotalCount(data.pagination.total)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, statusFilter, searchTerm])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadOrders()
  }

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
    setPage(1)
  }

  const handleInitiateStatusChange = (order: AdminOrder, newStatus: AdminOrderStatus) => {
    if (order.status === newStatus) return
    const option = STATUS_OPTIONS.find((s) => s.value === newStatus)
    const label = option ? option.label : newStatus
    setPendingStatusUpdate({
      order,
      newStatus,
      newStatusLabel: label,
    })
  }

  const handleConfirmStatusUpdate = async () => {
    if (!pendingStatusUpdate) return
    setIsUpdatingStatus(true)
    setStatusFeedback(null)

    try {
      const result = await updateAdminOrderStatus(
        pendingStatusUpdate.order.orderId,
        pendingStatusUpdate.newStatus
      )
      // Update in local state immediately
      setOrders((prev) =>
        prev.map((o) => (o.orderId === result.order.orderId ? { ...o, ...result.order } : o))
      )
      setStatusFeedback({ type: 'success', message: 'Order status updated successfully.' })
      setPendingStatusUpdate(null)
      setTimeout(() => setStatusFeedback(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update order status.'
      setStatusFeedback({ type: 'error', message: msg })
    } finally {
      setIsUpdatingStatus(false)
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
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
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
      case 'packed':
      case 'shipped':
      case 'out_for_delivery':
        return 'status-badge status-info'
      case 'cancelled':
        return 'status-badge status-danger'
      default:
        return 'status-badge status-warning'
    }
  }

  const formatStatusDisplay = (status: string) => {
    const matched = STATUS_OPTIONS.find((s) => s.value === status)
    if (matched) return matched.label
    return status.replace(/_/g, ' ')
  }

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders Management</h1>
          <p className="admin-page-subtitle">
            View customer orders, update order status with notifications, and manage logistics tracking.
          </p>
        </div>
      </header>

      {/* Global Feedback Banner */}
      {statusFeedback && (
        <div
          className={`admin-feedback-alert ${
            statusFeedback.type === 'success' ? 'feedback-success' : 'feedback-error'
          }`}
          style={{ marginBottom: '1.25rem' }}
          role="alert"
        >
          {statusFeedback.message}
        </div>
      )}

      {/* Control Bar: Search, Status Filter, Refresh */}
      <div className="admin-controls-card">
        <form onSubmit={handleSearchSubmit} className="admin-search-form">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by Order ID, name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-secondary">
            Search
          </button>
        </form>

        <div className="admin-filter-group">
          <label htmlFor="status-filter" className="admin-filter-label">
            Filter Status:
          </label>
          <select
            id="status-filter"
            className="admin-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={loadOrders}
            disabled={isLoading}
            title="Refresh order list"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="admin-state-container" role="status">
          <div className="admin-spinner" />
          <p>Loading administrative orders...</p>
        </div>
      ) : errorMessage ? (
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage}</p>
          <button type="button" className="admin-btn admin-btn-primary" onClick={loadOrders}>
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-state-container admin-state-empty">
          <p className="admin-empty-title">No orders found</p>
          <p className="admin-empty-desc">
            {searchTerm || statusFilter !== 'all'
              ? 'Try modifying your search query or filter criteria.'
              : 'There are currently no customer orders in the system.'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setPage(1)
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Change Status</th>
                  <th className="text-right" style={{ whiteSpace: 'nowrap', minWidth: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const paymentStatus = order.payment?.status || 'pending'
                  const isPaid = paymentStatus === 'paid'

                  return (
                    <tr key={order.orderId}>
                      <td className="font-mono font-bold text-white">
                        {order.orderId}
                      </td>
                      <td>
                        <div className="admin-customer-cell">
                          <span className="customer-name font-medium">
                            {order.customer.firstName} {order.customer.lastName}
                          </span>
                          <span className="customer-sub">{order.customer.email}</span>
                          <span className="customer-sub">{order.customer.phone}</span>
                        </div>
                      </td>
                      <td className="text-muted">{formatDate(order.createdAt)}</td>
                      <td className="font-medium text-white">
                        {formatPrice(order.pricing.total)}
                      </td>
                      <td>
                        <span className={isPaid ? 'payment-badge-paid' : 'payment-badge-pending'}>
                          {paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(order.status)}>
                          {formatStatusDisplay(order.status).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {/* Change Status Dropdown */}
                        <select
                          className="admin-status-dropdown"
                          value={order.status}
                          disabled={order.status === 'cancelled' || order.status === 'delivered'}
                          onChange={(e) =>
                            handleInitiateStatusChange(order, e.target.value as AdminOrderStatus)
                          }
                          aria-label={`Change status for order ${order.orderId}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-right" style={{ whiteSpace: 'nowrap', minWidth: '130px' }}>
                        <Link
                          to={`/admin/orders/${order.orderId}`}
                          className="admin-btn-action"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="admin-pagination-bar">
            <span className="admin-pagination-info">
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total orders)
            </span>
            <div className="admin-pagination-btns">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Status Change Confirmation Modal (Requirement 12) */}
      {pendingStatusUpdate && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <h3 className="admin-modal-title">Confirm Status Change</h3>
            <p className="admin-modal-body">
              Update order status to <strong>{pendingStatusUpdate.newStatusLabel}</strong> for order{' '}
              <span style={{ color: '#d94700', fontFamily: 'monospace', fontWeight: 'bold' }}>
                {pendingStatusUpdate.order.orderId}
              </span>
              ?
              <br />
              <span style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '0.5rem', display: 'block' }}>
                Upon confirmation, the status will be saved to MongoDB and an update email will be sent to the customer.
              </span>
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setPendingStatusUpdate(null)}
                disabled={isUpdatingStatus}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleConfirmStatusUpdate}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders
