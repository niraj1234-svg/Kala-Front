import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchAdminDashboardSummary,
  type AdminDashboardSummaryData,
  type AdminDashboardRecentOrder,
  type AdminDashboardRecentCustomer,
  type AdminDashboardRecentRequest,
} from '../../services/adminApi'
import '../../styles/Admin.css'

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()

  const [summaryData, setSummaryData] = useState<AdminDashboardSummaryData | null>(null)
  const [recentOrders, setRecentOrders] = useState<AdminDashboardRecentOrder[]>([])
  const [recentCustomers, setRecentCustomers] = useState<AdminDashboardRecentCustomer[]>([])
  const [recentRequests, setRecentRequests] = useState<AdminDashboardRecentRequest[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // INR Currency Formatter
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }, [])

  // Standard Number Formatter (Indian System)
  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat('en-IN').format(num)
  }, [])

  // Date Formatter
  const formatDate = useCallback((dateStr: string): string => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }, [])

  // Status Badge Class Generator
  const getStatusBadgeClass = useCallback((status: string): string => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
      case 'approved':
        return 'status-badge-delivered'
      case 'shipped':
      case 'quoted':
        return 'status-badge-shipped'
      case 'processing':
      case 'contacted':
        return 'status-badge-processing'
      case 'confirmed':
        return 'status-badge-confirmed'
      case 'pending':
        return 'status-badge-pending'
      case 'cancelled':
        return 'status-badge-cancelled'
      default:
        return 'status-badge-pending'
    }
  }, [])

  // Fetch Dashboard Summary from API
  const loadDashboardData = useCallback(
    async (isManualRefresh = false): Promise<void> => {
      if (isManualRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setErrorMessage(null)

      try {
        const response = await fetchAdminDashboardSummary()
        if (response && response.success) {
          setSummaryData(response.summary)
          setRecentOrders(response.recentOrders || [])
          setRecentCustomers(response.recentCustomers || [])
          setRecentRequests(response.recentRequests || [])
        } else {
          setErrorMessage('Unable to load dashboard.')
        }
      } catch (err: unknown) {
        console.error('Failed to load admin dashboard summary:', err)
        if (err instanceof Error && err.message.includes('expired')) {
          navigate('/admin/login', { replace: true })
          return
        }
        setErrorMessage('Unable to load dashboard.')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [navigate]
  )

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Orders needing urgent attention: pending, processing, or confirmed
  const ordersNeedingAttention = useMemo(() => {
    return recentOrders.filter((order) =>
      ['pending', 'processing', 'confirmed'].includes(order.status.toLowerCase())
    )
  }, [recentOrders])

  return (
    <div className="admin-page-container">
      {/* 1. DASHBOARD HEADER */}
      <header className="admin-page-header">
        <div className="admin-page-header-left">
          <div className="admin-breadcrumb-badge">Operations</div>
          <h1 className="admin-page-title">KALA ADMIN</h1>
          <p className="admin-page-subtitle">Business command center</p>
        </div>

        <div className="admin-page-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => loadDashboardData(true)}
            disabled={isLoading || isRefreshing}
            aria-label="Refresh dashboard data"
          >
            <svg
              className={`admin-icon ${isRefreshing ? 'admin-spin' : ''}`}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* 2. LOADING STATE */}
      {isLoading && !summaryData && (
        <div className="admin-state-container">
          <div className="admin-spinner" aria-hidden="true" />
          <p className="admin-state-text">Loading command center metrics...</p>
        </div>
      )}

      {/* 3. ERROR STATE */}
      {errorMessage && !summaryData && (
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage}</p>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => loadDashboardData()}
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. DASHBOARD CONTENT */}
      {summaryData && (
        <div className="admin-dashboard-wrapper">
          {/* A. QUICK ACTIONS TOOLBAR */}
          <section
            className="admin-quick-actions-bar"
            aria-label="Quick management actions"
          >
            <span className="admin-quick-actions-label">Quick Actions:</span>
            <div className="admin-quick-actions-links">
              <Link to="/admin/orders" className="admin-quick-action-chip">
                Manage Orders
              </Link>
              <Link to="/admin/products" className="admin-quick-action-chip">
                Manage Products
              </Link>
              <Link to="/admin/customers" className="admin-quick-action-chip">
                Manage Customers
              </Link>
              <Link to="/admin/custom-requests" className="admin-quick-action-chip">
                Custom Apparel
              </Link>
              <Link to="/admin/business-requests" className="admin-quick-action-chip">
                Business Branding
              </Link>
              <Link to="/admin/analytics" className="admin-quick-action-chip highlight">
                View Analytics
              </Link>
            </div>
          </section>

          {/* B. TOP METRIC CARDS (6 CARDS) */}
          <section aria-labelledby="dashboard-metrics-heading">
            <h2 id="dashboard-metrics-heading" className="sr-only">
              Command Center Primary Metrics
            </h2>
            <div className="admin-analytics-metrics-grid">
              {/* Card 1: Total Revenue */}
              <div className="admin-metric-card highlight-revenue">
                <span className="admin-metric-label">Total Revenue</span>
                <span className="admin-metric-value text-white">
                  {formatCurrency(summaryData.totalRevenue ?? summaryData.today.revenue)}
                </span>
                <span className="admin-metric-sub">
                  All-time non-cancelled sales
                </span>
              </div>

              {/* Card 2: Total Orders */}
              <div className="admin-metric-card">
                <span className="admin-metric-label">Total Orders</span>
                <span className="admin-metric-value">
                  {formatNumber(summaryData.totalOrders ?? summaryData.today.orders)}
                </span>
                <span className="admin-metric-sub">
                  Total store orders placed
                </span>
              </div>

              {/* Card 3: Total Customers */}
              <div className="admin-metric-card">
                <span className="admin-metric-label">Total Customers</span>
                <span className="admin-metric-value">
                  {formatNumber(summaryData.totalCustomers ?? summaryData.customers.total)}
                </span>
                <span className="admin-metric-sub">
                  {summaryData.customers.newToday > 0
                    ? `+${formatNumber(summaryData.customers.newToday)} new today`
                    : 'Registered customer accounts'}
                </span>
              </div>

              {/* Card 4: Products */}
              <div className="admin-metric-card">
                <span className="admin-metric-label">Products</span>
                <span className="admin-metric-value">
                  {formatNumber(summaryData.totalProducts ?? 20)}
                </span>
                <span className="admin-metric-sub">
                  Active catalog products
                </span>
              </div>

              {/* Card 5: Pending Orders */}
              <div className="admin-metric-card">
                <span className="admin-metric-label">Pending Orders</span>
                <span className="admin-metric-value text-warning">
                  {formatNumber(summaryData.pendingOrders ?? summaryData.orders.pending)}
                </span>
                <span className="admin-metric-sub">
                  {summaryData.orders.processing > 0
                    ? `${formatNumber(summaryData.orders.processing)} in processing`
                    : 'Awaiting fulfillment'}
                </span>
              </div>

              {/* Card 6: Custom Requests */}
              <div className="admin-metric-card">
                <span className="admin-metric-label">Custom Requests</span>
                <span className="admin-metric-value text-accent">
                  {formatNumber(summaryData.totalCustomRequests ?? summaryData.requests.customApparelPending)}
                </span>
                <span className="admin-metric-sub">
                  {summaryData.requests.customApparelPending > 0
                    ? `${formatNumber(summaryData.requests.customApparelPending)} pending review`
                    : 'Apparel design inquiries'}
                </span>
              </div>

              {/* Card 7: Business Requests */}
              <div className="admin-metric-card">
                <span className="admin-metric-label">Business Requests</span>
                <span className="admin-metric-value text-accent">
                  {formatNumber(summaryData.totalBusinessRequests ?? summaryData.requests.businessBrandingPending)}
                </span>
                <span className="admin-metric-sub">
                  {summaryData.requests.businessBrandingPending > 0
                    ? `${formatNumber(summaryData.requests.businessBrandingPending)} pending quotes`
                    : 'Corporate quote requests'}
                </span>
              </div>
            </div>
          </section>

          {/* C. ORDERS NEEDING ATTENTION */}
          <section
            className="admin-dashboard-section"
            aria-labelledby="orders-needing-attention-heading"
          >
            <div className="admin-section-header-flex">
              <div>
                <h2
                  id="orders-needing-attention-heading"
                  className="admin-dashboard-section-title text-warning"
                >
                  Orders Needing Attention
                </h2>
                <p className="admin-dashboard-section-desc">
                  Active orders requiring immediate fulfillment, processing, or review.
                </p>
              </div>
              <Link to="/admin/orders" className="admin-section-view-all">
                Fulfillment queue →
              </Link>
            </div>

            {ordersNeedingAttention.length === 0 ? (
              <div className="admin-empty-card">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p>No orders currently require immediate attention.</p>
                <span className="admin-empty-sub">
                  All pending orders have been processed or delivered.
                </span>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Order ID</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Items</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersNeedingAttention.map((order) => (
                      <tr key={order.orderId}>
                        <td>
                          <span className="font-mono text-bold text-white">
                            {order.orderId}
                          </span>
                        </td>
                        <td>
                          <div>
                            <span className="text-bold">{order.customerName}</span>
                            <span className="admin-cell-sub">
                              {order.customerEmail}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-bold">
                            {order.itemCount || 1}
                          </span>
                        </td>
                        <td>
                          <span className="text-bold font-mono">
                            {formatCurrency(order.total)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-right">
                          <Link
                            to={`/admin/orders/${order.orderId}`}
                            className="admin-btn admin-btn-sm admin-btn-secondary"
                          >
                            View Order
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* D. RECENT ORDERS (LATEST 5) */}
          <section
            className="admin-dashboard-section"
            aria-labelledby="recent-orders-heading"
          >
            <div className="admin-section-header-flex">
              <div>
                <h2
                  id="recent-orders-heading"
                  className="admin-dashboard-section-title"
                >
                  Recent Orders
                </h2>
                <p className="admin-dashboard-section-desc">
                  Latest order transactions across the KALA store.
                </p>
              </div>
              <Link to="/admin/orders" className="admin-section-view-all">
                View all orders →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="admin-empty-card">
                <p>No orders found in database.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Order ID</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Items</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Status</th>
                      <th scope="col">Date</th>
                      <th scope="col" className="text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.orderId}>
                        <td>
                          <span className="font-mono text-bold text-white">
                            {order.orderId}
                          </span>
                        </td>
                        <td>
                          <div>
                            <span className="text-bold">{order.customerName}</span>
                            <span className="admin-cell-sub">
                              {order.customerEmail}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-bold">
                            {order.itemCount || 1}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-bold">
                            {formatCurrency(order.total)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td className="text-right">
                          <Link
                            to={`/admin/orders/${order.orderId}`}
                            className="admin-btn admin-btn-sm admin-btn-secondary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* E. TWO-COLUMN GRID: RECENT CUSTOMERS & REQUESTS REQUIRING ATTENTION */}
          <div className="admin-dashboard-two-col">
            {/* COLUMN 1: RECENT CUSTOMERS */}
            <section
              className="admin-dashboard-card-section"
              aria-labelledby="recent-customers-heading"
            >
              <div className="admin-section-header-flex">
                <div>
                  <h2
                    id="recent-customers-heading"
                    className="admin-dashboard-section-title"
                  >
                    Recent Customers
                  </h2>
                  <p className="admin-dashboard-section-desc">
                    Newly registered customer accounts.
                  </p>
                </div>
                <Link to="/admin/customers" className="admin-section-view-all">
                  View all customers →
                </Link>
              </div>

              {recentCustomers.length === 0 ? (
                <div className="admin-empty-card">
                  <p>No registered customers found.</p>
                </div>
              ) : (
                <div className="admin-customers-list">
                  {recentCustomers.map((cust) => (
                    <div key={cust.userId} className="admin-customer-row">
                      <div className="admin-customer-info">
                        <div className="admin-customer-avatar">
                          {cust.firstName ? cust.firstName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="admin-customer-details">
                          <span className="admin-customer-name">
                            {cust.firstName} {cust.lastName}
                          </span>
                          <span className="admin-customer-email">
                            {cust.email}
                          </span>
                        </div>
                      </div>
                      <div className="admin-customer-action-col">
                        <span className="admin-customer-date text-muted">
                          Joined {formatDate(cust.createdAt)}
                        </span>
                        <Link
                          to={`/admin/customers/${cust.userId}`}
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* COLUMN 2: REQUESTS REQUIRING ATTENTION */}
            <section
              className="admin-dashboard-card-section"
              aria-labelledby="pending-requests-heading"
            >
              <div className="admin-section-header-flex">
                <div>
                  <h2
                    id="pending-requests-heading"
                    className="admin-dashboard-section-title"
                  >
                    Requests Requiring Attention
                  </h2>
                  <p className="admin-dashboard-section-desc">
                    Custom apparel & corporate branding inquiries.
                  </p>
                </div>
                <div className="admin-requests-links-flex">
                  <Link
                    to="/admin/custom-requests"
                    className="admin-section-view-all"
                  >
                    Custom
                  </Link>
                  <span className="text-muted">|</span>
                  <Link
                    to="/admin/business-requests"
                    className="admin-section-view-all"
                  >
                    Corporate →
                  </Link>
                </div>
              </div>

              {recentRequests.length === 0 ? (
                <div className="admin-empty-card">
                  <p>No pending custom or branding inquiries.</p>
                </div>
              ) : (
                <div className="admin-requests-list">
                  {recentRequests.map((req) => (
                    <div key={req.requestId} className="admin-request-row">
                      <div className="admin-request-info">
                        <div className="admin-request-tag-badge">
                          {req.requestType === 'custom_apparel' ? 'APPAREL' : 'CORPORATE'}
                        </div>
                        <div className="admin-request-details">
                          <div className="admin-request-title-row">
                            <span className="font-mono text-bold text-white">
                              {req.requestId}
                            </span>
                            <span
                              className={`status-badge ${getStatusBadgeClass(
                                req.status
                              )}`}
                            >
                              {req.status.toUpperCase()}
                            </span>
                          </div>
                          <span className="admin-request-contact">
                            {req.name} ({req.email})
                          </span>
                          {req.detail && (
                            <span className="admin-request-detail-text">
                              {req.detail}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="admin-request-action-col">
                        <span className="admin-request-date text-muted">
                          {formatDate(req.createdAt)}
                        </span>
                        <Link
                          to={
                            req.requestType === 'custom_apparel'
                              ? '/admin/custom-requests'
                              : '/admin/business-requests'
                          }
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
