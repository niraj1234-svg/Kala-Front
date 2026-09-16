import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminOrders,
  type AdminOrder,
  type AdminOrderStatus,
} from '../../services/adminApi'
import '../../styles/Admin.css'

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

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
    setPage(1)
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
      case 'shipped':
        return 'status-badge status-info'
      case 'cancelled':
        return 'status-badge status-danger'
      default:
        return 'status-badge status-warning'
    }
  }

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders Management</h1>
          <p className="admin-page-subtitle">
            View customer orders, filter fulfillment states, and manage logistics tracking.
          </p>
        </div>
      </header>

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
            onChange={handleStatusChange}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
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
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0)
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
                        </div>
                      </td>
                      <td className="text-muted">{formatDate(order.createdAt)}</td>
                      <td>
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="font-medium text-white">
                        {formatPrice(order.pricing.total)}
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right">
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
    </div>
  )
}

export default AdminOrders
