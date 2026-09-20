import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchAdminDashboardSummary,
  fetchAdminCustomers,
  type AdminDashboardSummaryData,
  type AdminDashboardRecentOrder,
  type AdminDashboardRecentRequest,
  type AdminCustomerAccount,
} from '../../services/adminApi'
import '../../styles/Admin.css'

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()

  const [summaryData, setSummaryData] = useState<AdminDashboardSummaryData | null>(null)
  const [recentOrders, setRecentOrders] = useState<AdminDashboardRecentOrder[]>([])
  const [recentRequests, setRecentRequests] = useState<AdminDashboardRecentRequest[]>([])
  const [customers, setCustomers] = useState<AdminCustomerAccount[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Customer Search & Filter States
  const [customerSearch, setCustomerSearch] = useState<string>('')
  const [customerFilter, setCustomerFilter] = useState<'all' | 'active' | 'with_orders'>('all')
  const [isCustomerLoading, setIsCustomerLoading] = useState<boolean>(false)

  // Currency Formatter
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }, [])

  // Number Formatter
  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat('en-IN').format(num)
  }, [])

  // Date Formatter
  const formatDate = useCallback((dateStr: string): string => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }, [])

  // Status Badge Helper
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

  // Load Dashboard Core Data
  const loadDashboardData = useCallback(
    async (isManualRefresh = false): Promise<void> => {
      if (isManualRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setErrorMessage(null)

      try {
        const [summaryRes, customersRes] = await Promise.all([
          fetchAdminDashboardSummary(),
          fetchAdminCustomers({ page: 1, limit: 10, search: customerSearch }),
        ])

        if (summaryRes && summaryRes.success) {
          setSummaryData(summaryRes.summary)
          setRecentOrders(summaryRes.recentOrders || [])
          setRecentRequests(summaryRes.recentRequests || [])
        } else {
          setErrorMessage('Unable to load dashboard summary.')
        }

        if (customersRes && customersRes.success) {
          setCustomers(customersRes.customers || [])
        }
      } catch (err: unknown) {
        console.error('Failed to load admin dashboard data:', err)
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
    [customerSearch, navigate]
  )

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Handle live customer search submit
  const handleCustomerSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCustomerLoading(true)
    try {
      const res = await fetchAdminCustomers({
        page: 1,
        limit: 10,
        search: customerSearch.trim(),
      })
      if (res && res.success) {
        setCustomers(res.customers || [])
      }
    } catch (err) {
      console.error('Customer search failed:', err)
    } finally {
      setIsCustomerLoading(false)
    }
  }

  // Filtered customers list
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      if (customerFilter === 'with_orders') {
        return cust.orderCount > 0
      }
      if (customerFilter === 'active') {
        return (cust.role || 'customer') !== 'disabled'
      }
      return true
    })
  }, [customers, customerFilter])

  return (
    <div className="admin-page-container">
      {/* 1. DASHBOARD HEADER */}
      <header className="admin-page-header">
        <div className="admin-page-header-left">
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome to KALA Admin Control Center</p>
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
              width="14"
              height="14"
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

      {/* LOADING STATE */}
      {isLoading && !summaryData && (
        <div className="admin-state-container">
          <div className="admin-spinner" aria-hidden="true" />
          <p className="admin-state-text">Loading dashboard metrics...</p>
        </div>
      )}

      {/* ERROR STATE */}
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

      {/* DASHBOARD CONTENT */}
      {summaryData && (
        <div className="admin-dashboard-wrapper">
          {/* 2. IMPORTANT NUMBERS (TOP 6 CARDS) */}
          <section className="admin-dashboard-metrics-section" aria-label="Key Metrics">
            <div className="admin-clean-metrics-grid">
              {/* Card 1: Total Customers */}
              <div className="admin-clean-card">
                <span className="admin-card-label">TOTAL CUSTOMERS</span>
                <span className="admin-card-value">
                  {formatNumber(summaryData.totalCustomers ?? summaryData.customers.total)}
                </span>
              </div>

              {/* Card 2: New Customers */}
              <div className="admin-clean-card">
                <span className="admin-card-label">NEW CUSTOMERS</span>
                <span className="admin-card-value text-accent">
                  +{formatNumber(summaryData.customers.newToday)}
                </span>
              </div>

              {/* Card 3: Total Orders */}
              <div className="admin-clean-card">
                <span className="admin-card-label">TOTAL ORDERS</span>
                <span className="admin-card-value">
                  {formatNumber(summaryData.totalOrders ?? summaryData.today.orders)}
                </span>
              </div>

              {/* Card 4: Total Revenue */}
              <div className="admin-clean-card">
                <span className="admin-card-label">TOTAL REVENUE</span>
                <span className="admin-card-value">
                  {formatCurrency(summaryData.totalRevenue ?? summaryData.today.revenue)}
                </span>
              </div>

              {/* Card 5: Pending Orders */}
              <div className="admin-clean-card">
                <span className="admin-card-label">PENDING ORDERS</span>
                <span className="admin-card-value text-warning">
                  {formatNumber(summaryData.pendingOrders ?? summaryData.orders.pending)}
                </span>
              </div>

              {/* Card 6: Products */}
              <div className="admin-clean-card">
                <span className="admin-card-label">PRODUCTS</span>
                <span className="admin-card-value">
                  {formatNumber(summaryData.totalProducts ?? 20)}
                </span>
              </div>
            </div>
          </section>

          {/* 3. CUSTOMER OVERVIEW SECTION */}
          <section className="admin-dashboard-section" aria-label="Customer Overview">
            <div className="admin-section-header-flex">
              <div>
                <h2 className="admin-dashboard-section-title">Customers</h2>
                <p className="admin-dashboard-section-desc">
                  Overview of registered customer accounts.
                </p>
              </div>
              <Link to="/admin/customers" className="admin-section-view-all">
                View all customers →
              </Link>
            </div>

            {/* Search & Simple Filter Toolbar */}
            <div className="admin-customer-toolbar">
              <form onSubmit={handleCustomerSearch} className="admin-customer-search-form">
                <input
                  type="text"
                  className="admin-customer-search-input"
                  placeholder="Search customers by name, email, or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                <button type="submit" className="admin-btn admin-btn-secondary admin-btn-sm">
                  Search
                </button>
                {customerSearch && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => {
                      setCustomerSearch('')
                      loadDashboardData()
                    }}
                  >
                    Clear
                  </button>
                )}
              </form>

              <div className="admin-customer-filter-group">
                <button
                  type="button"
                  className={`admin-filter-pill ${customerFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCustomerFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill ${customerFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setCustomerFilter('active')}
                >
                  Active customers
                </button>
                <button
                  type="button"
                  className={`admin-filter-pill ${customerFilter === 'with_orders' ? 'active' : ''}`}
                  onClick={() => setCustomerFilter('with_orders')}
                >
                  Customers with orders
                </button>
              </div>
            </div>

            {/* Customers Table */}
            {isCustomerLoading ? (
              <div className="admin-state-container">
                <div className="admin-spinner" aria-hidden="true" />
                <p className="admin-state-text">Searching customers...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="admin-empty-card">
                <p>No customers found matching your criteria.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Orders</th>
                      <th scope="col">Joined</th>
                      <th scope="col" className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((cust) => (
                      <tr key={cust.userId}>
                        <td>
                          <span className="text-bold">
                            {cust.firstName} {cust.lastName}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-sm">{cust.email}</span>
                        </td>
                        <td>
                          <span className="font-mono text-sm text-muted">
                            {cust.phone || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="admin-badge-count">
                            {cust.orderCount} {cust.orderCount === 1 ? 'order' : 'orders'}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted text-sm">
                            {formatDate(cust.createdAt)}
                          </span>
                        </td>
                        <td className="text-right">
                          <Link
                            to={`/admin/customers/${cust.userId}`}
                            className="admin-btn admin-btn-sm admin-btn-primary"
                          >
                            VIEW
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 4. RECENT ORDERS SECTION */}
          <section className="admin-dashboard-section" aria-label="Recent Orders">
            <div className="admin-section-header-flex">
              <div>
                <h2 className="admin-dashboard-section-title">Recent Orders</h2>
                <p className="admin-dashboard-section-desc">
                  Latest store orders.
                </p>
              </div>
              <Link to="/admin/orders" className="admin-section-view-all">
                View all orders →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="admin-empty-card">
                <p>No recent orders found.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Order ID</th>
                      <th scope="col">Date</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-right">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.orderId}>
                        <td>
                          <span className="font-mono text-bold">
                            {order.orderId}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted text-sm">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td>
                          <span className="text-bold">{order.customerName}</span>
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

          {/* 5. REQUESTS NEEDING ATTENTION */}
          {recentRequests.length > 0 && (
            <section className="admin-dashboard-section" aria-label="Requests Needing Attention">
              <div className="admin-section-header-flex">
                <div>
                  <h2 className="admin-dashboard-section-title">Requests Needing Attention</h2>
                  <p className="admin-dashboard-section-desc">
                    Inquiries requiring review or quotes.
                  </p>
                </div>
                <div className="admin-requests-links-flex">
                  <Link to="/admin/custom-requests" className="admin-section-view-all">
                    Custom Apparel →
                  </Link>
                  <span className="text-muted">|</span>
                  <Link to="/admin/business-requests" className="admin-section-view-all">
                    Corporate Branding →
                  </Link>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Request ID</th>
                      <th scope="col">Type</th>
                      <th scope="col">Contact</th>
                      <th scope="col">Details</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((req) => (
                      <tr key={req.requestId}>
                        <td>
                          <span className="font-mono text-bold">{req.requestId}</span>
                        </td>
                        <td>
                          <span className="admin-badge-count">
                            {req.requestType === 'custom_apparel' ? 'Apparel' : 'Corporate'}
                          </span>
                        </td>
                        <td>
                          <div>
                            <span className="text-bold">{req.name}</span>
                            <span className="admin-cell-sub">{req.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm text-muted">{req.detail || '—'}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(req.status)}`}>
                            {req.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-right">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
