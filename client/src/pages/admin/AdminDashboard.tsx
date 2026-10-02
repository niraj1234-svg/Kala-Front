import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'
import {
  fetchAdminDashboardSummary,
  type AdminDashboardSummaryData,
  type AdminDashboardRecentOrder,
  type AdminDashboardRecentRequest,
  type AdminDashboardRecentCustomer,
} from '../../services/adminApi'
import '../../styles/Admin.css'

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { adminUser } = useAdmin()

  const [summaryData, setSummaryData] = useState<AdminDashboardSummaryData | null>(null)
  const [recentOrders, setRecentOrders] = useState<AdminDashboardRecentOrder[]>([])
  const [recentRequests, setRecentRequests] = useState<AdminDashboardRecentRequest[]>([])
  const [recentCustomers, setRecentCustomers] = useState<AdminDashboardRecentCustomer[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

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

  // Time Formatter for Last Updated
  const formatTime = useCallback((date: Date): string => {
    try {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }, [])

  // Status Badge Class Helper
  const getStatusPillClass = useCallback((status: string): string => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
      case 'approved':
        return 'status-pill-delivered'
      case 'shipped':
      case 'quoted':
        return 'status-pill-shipped'
      case 'processing':
      case 'contacted':
        return 'status-pill-processing'
      case 'confirmed':
        return 'status-pill-confirmed'
      case 'pending':
        return 'status-pill-pending'
      case 'cancelled':
        return 'status-pill-cancelled'
      default:
        return 'status-pill-pending'
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
        const summaryRes = await fetchAdminDashboardSummary()

        if (summaryRes && summaryRes.success) {
          setSummaryData(summaryRes.summary)
          setRecentOrders(summaryRes.recentOrders || [])
          setRecentRequests(summaryRes.recentRequests || [])
          setRecentCustomers(summaryRes.recentCustomers || [])
          setLastUpdated(new Date())
        } else {
          setErrorMessage('Unable to load dashboard summary metrics.')
        }
      } catch (err: unknown) {
        console.error('Failed to load admin dashboard data:', err)
        if (err instanceof Error && err.message.includes('expired')) {
          navigate('/admin/login', { replace: true })
          return
        }
        setErrorMessage('Unable to connect to the administration server.')
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

  // Calculated Order Pipeline Percentages
  const pipelineStats = useMemo(() => {
    if (!summaryData?.orders) {
      return {
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        total: 0,
        pendingPct: 0,
        confirmedPct: 0,
        processingPct: 0,
        shippedPct: 0,
        deliveredPct: 0,
        cancelledPct: 0,
      }
    }

    const o = summaryData.orders
    const pending = o.pending || 0
    const confirmed = o.confirmed || 0
    const processing = o.processing || 0
    const shipped = o.shipped || 0
    const delivered = o.delivered || 0
    const cancelled = o.cancelled || 0
    const total = pending + confirmed + processing + shipped + delivered + cancelled

    const getPct = (val: number) => (total > 0 ? (val / total) * 100 : 0)

    return {
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      total,
      pendingPct: getPct(pending),
      confirmedPct: getPct(confirmed),
      processingPct: getPct(processing),
      shippedPct: getPct(shipped),
      deliveredPct: getPct(delivered),
      cancelledPct: getPct(cancelled),
    }
  }, [summaryData])

  // Total pending requests requiring attention
  const totalPendingInquiries = useMemo(() => {
    if (!summaryData?.requests) return 0
    return (
      (summaryData.requests.customApparelPending || 0) +
      (summaryData.requests.businessBrandingPending || 0)
    )
  }, [summaryData])

  return (
    <div className="admin-page-container">
      {/* 1. HERO HEADER WITH LIVE SYSTEM STATUS */}
      <header className="admin-dashboard-hero">
        <div className="admin-dashboard-hero-left">
          <h1 className="admin-dashboard-greeting">
            <span>Welcome back{adminUser?.firstName ? `, ${adminUser.firstName}` : ''}</span>
          </h1>
          <p className="admin-dashboard-hero-subtitle">
            KALA Store Operational Command Center • Real-time commerce overview
          </p>
        </div>

        <div className="admin-dashboard-hero-actions">
          <div className="admin-live-pulse" title="System connected to MongoDB">
            <span className="admin-pulse-dot" aria-hidden="true" />
            <span>Store Live • {formatTime(lastUpdated)}</span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-secondary"
            title="Preview consumer storefront in new tab"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '6px' }}
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>View Store</span>
          </a>

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
              style={{ marginRight: '6px' }}
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
          <p className="admin-state-text">Aggregating live store performance metrics...</p>
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
            Retry Connection
          </button>
        </div>
      )}

      {/* DASHBOARD CONTENT */}
      {summaryData && (
        <div className="admin-dashboard-content">
          {/* 2. EXECUTIVE KPI CARDS GRID (6 HIGH-IMPACT METRICS) */}
          <section className="admin-dashboard-metrics-section" aria-label="Executive Metrics">
            <div className="admin-kpi-grid">
              {/* KPI 1: TOTAL REVENUE */}
              <div className="admin-kpi-card highlight-accent">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-label">Total Revenue</span>
                  <div className="admin-kpi-icon-wrap admin-kpi-icon-orange" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h12M6 8h12M6 13l7.5 8M6 13h4.5a4.5 4.5 0 0 0 0-9" />
                    </svg>
                  </div>
                </div>
                <div className="admin-kpi-value">
                  {formatCurrency(summaryData.totalRevenue ?? summaryData.today.revenue)}
                </div>
                <div className="admin-kpi-footer">
                  <span className="admin-kpi-badge admin-kpi-badge-positive">
                    +{formatCurrency(summaryData.today.revenue)} today
                  </span>
                  <Link to="/admin/analytics" className="admin-kpi-link">
                    Analytics →
                  </Link>
                </div>
              </div>

              {/* KPI 2: TOTAL ORDERS */}
              <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-label">Total Orders</span>
                  <div className="admin-kpi-icon-wrap admin-kpi-icon-blue" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                </div>
                <div className="admin-kpi-value">
                  {formatNumber(summaryData.totalOrders ?? summaryData.today.orders)}
                </div>
                <div className="admin-kpi-footer">
                  <span className="admin-kpi-badge admin-kpi-badge-neutral">
                    {summaryData.today.orders} placed today
                  </span>
                  <Link to="/admin/orders" className="admin-kpi-link">
                    Orders →
                  </Link>
                </div>
              </div>

              {/* KPI 3: PENDING ORDERS (ACTION REQUIRED) */}
              <div className={`admin-kpi-card ${pipelineStats.pending > 0 ? 'highlight-warning' : ''}`}>
                <div className="admin-kpi-header">
                  <span className="admin-kpi-label">Pending Orders</span>
                  <div className="admin-kpi-icon-wrap admin-kpi-icon-amber" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                </div>
                <div className="admin-kpi-value text-warning">
                  {formatNumber(pipelineStats.pending)}
                </div>
                <div className="admin-kpi-footer">
                  {pipelineStats.pending > 0 ? (
                    <span className="admin-kpi-badge admin-kpi-badge-warning">
                      Action Required
                    </span>
                  ) : (
                    <span className="admin-kpi-badge admin-kpi-badge-positive">
                      All Caught Up
                    </span>
                  )}
                  <Link to="/admin/orders?status=pending" className="admin-kpi-link">
                    Fulfill →
                  </Link>
                </div>
              </div>

              {/* KPI 4: REGISTERED CUSTOMERS */}
              <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-label">Customers</span>
                  <div className="admin-kpi-icon-wrap admin-kpi-icon-emerald" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                </div>
                <div className="admin-kpi-value">
                  {formatNumber(summaryData.totalCustomers ?? summaryData.customers.total)}
                </div>
                <div className="admin-kpi-footer">
                  <span className="admin-kpi-badge admin-kpi-badge-positive">
                    +{summaryData.customers.newToday} joined today
                  </span>
                  <Link to="/admin/customers" className="admin-kpi-link">
                    Manage →
                  </Link>
                </div>
              </div>

              {/* KPI 5: ACTIVE CATALOG PRODUCTS */}
              <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-label">Active Catalog</span>
                  <div className="admin-kpi-icon-wrap admin-kpi-icon-purple" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                </div>
                <div className="admin-kpi-value">
                  {formatNumber(summaryData.totalProducts ?? 0)}
                </div>
                <div className="admin-kpi-footer">
                  <span className="admin-kpi-badge admin-kpi-badge-neutral">
                    Apparel Products
                  </span>
                  <Link to="/admin/products/create" className="admin-kpi-link">
                    + Add New →
                  </Link>
                </div>
              </div>

              {/* KPI 6: PENDING INQUIRIES */}
              <div className={`admin-kpi-card ${totalPendingInquiries > 0 ? 'highlight-warning' : ''}`}>
                <div className="admin-kpi-header">
                  <span className="admin-kpi-label">Inquiries Pending</span>
                  <div className="admin-kpi-icon-wrap admin-kpi-icon-cyan" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="admin-kpi-value">
                  {formatNumber(totalPendingInquiries)}
                </div>
                <div className="admin-kpi-footer">
                  <span className="admin-kpi-badge admin-kpi-badge-neutral">
                    Custom & Corporate
                  </span>
                  <Link to="/admin/custom-requests" className="admin-kpi-link">
                    Review →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 3. STORE LAUNCHPAD & QUICK ACTION SHORTCUTS */}
          <section className="admin-launchpad-section" aria-label="Store Quick Actions">
            <div className="admin-launchpad-header">
              <span className="admin-launchpad-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Store Launchpad & Shortcuts
              </span>
            </div>

            <div className="admin-launchpad-grid">
              <Link to="/admin/products/create" className="admin-shortcut-btn">
                <div className="admin-shortcut-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span>Add Product</span>
              </Link>

              <Link to="/admin/orders" className="admin-shortcut-btn">
                <div className="admin-shortcut-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <span>All Orders</span>
              </Link>

              <Link to="/admin/custom-requests" className="admin-shortcut-btn">
                <div className="admin-shortcut-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                    <circle cx="11" cy="11" r="2" />
                  </svg>
                </div>
                <span>Custom Apparel</span>
              </Link>

              <Link to="/admin/business-requests" className="admin-shortcut-btn">
                <div className="admin-shortcut-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <span>Corporate Inquiries</span>
              </Link>

              <Link to="/admin/coupons" className="admin-shortcut-btn">
                <div className="admin-shortcut-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <span>Discount Coupons</span>
              </Link>

              <Link to="/admin/customers" className="admin-shortcut-btn">
                <div className="admin-shortcut-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <span>Customer Directory</span>
              </Link>

              <Link to="/admin/analytics" className="admin-shortcut-btn">
                <div className="admin-shortcut-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <span>Sales Reports</span>
              </Link>
            </div>
          </section>

          {/* 4. ORDER FULFILLMENT PIPELINE & STATUS DISTRIBUTION */}
          <section className="admin-pipeline-card" aria-label="Order Fulfillment Pipeline">
            <div className="admin-pipeline-header">
              <div className="admin-pipeline-title-group">
                <h2 className="admin-pipeline-title">Order Fulfillment Pipeline</h2>
                <span className="admin-pipeline-subtitle">
                  Live distribution of all {formatNumber(pipelineStats.total)} store orders across processing stages
                </span>
              </div>
              <Link to="/admin/orders" className="admin-card-action-link">
                View all orders table →
              </Link>
            </div>

            {/* Segmented Progress Bar */}
            <div className="admin-pipeline-progress" aria-hidden="true">
              {pipelineStats.pendingPct > 0 && (
                <div
                  className="admin-pipeline-segment segment-pending"
                  style={{ width: `${pipelineStats.pendingPct}%` }}
                  title={`Pending: ${pipelineStats.pending}`}
                />
              )}
              {pipelineStats.confirmedPct > 0 && (
                <div
                  className="admin-pipeline-segment segment-confirmed"
                  style={{ width: `${pipelineStats.confirmedPct}%` }}
                  title={`Confirmed: ${pipelineStats.confirmed}`}
                />
              )}
              {pipelineStats.processingPct > 0 && (
                <div
                  className="admin-pipeline-segment segment-processing"
                  style={{ width: `${pipelineStats.processingPct}%` }}
                  title={`Processing: ${pipelineStats.processing}`}
                />
              )}
              {pipelineStats.shippedPct > 0 && (
                <div
                  className="admin-pipeline-segment segment-shipped"
                  style={{ width: `${pipelineStats.shippedPct}%` }}
                  title={`Shipped: ${pipelineStats.shipped}`}
                />
              )}
              {pipelineStats.deliveredPct > 0 && (
                <div
                  className="admin-pipeline-segment segment-delivered"
                  style={{ width: `${pipelineStats.deliveredPct}%` }}
                  title={`Delivered: ${pipelineStats.delivered}`}
                />
              )}
              {pipelineStats.cancelledPct > 0 && (
                <div
                  className="admin-pipeline-segment segment-cancelled"
                  style={{ width: `${pipelineStats.cancelledPct}%` }}
                  title={`Cancelled: ${pipelineStats.cancelled}`}
                />
              )}
            </div>

            {/* Interactive Status Chips (Direct links to filtered orders) */}
            <div className="admin-pipeline-chips">
              <Link to="/admin/orders?status=pending" className="admin-pipeline-chip">
                <div className="admin-chip-left">
                  <span className="admin-chip-dot dot-pending" aria-hidden="true" />
                  <span>Pending</span>
                </div>
                <span className="admin-chip-count">{pipelineStats.pending}</span>
              </Link>

              <Link to="/admin/orders?status=confirmed" className="admin-pipeline-chip">
                <div className="admin-chip-left">
                  <span className="admin-chip-dot dot-confirmed" aria-hidden="true" />
                  <span>Confirmed</span>
                </div>
                <span className="admin-chip-count">{pipelineStats.confirmed}</span>
              </Link>

              <Link to="/admin/orders?status=processing" className="admin-pipeline-chip">
                <div className="admin-chip-left">
                  <span className="admin-chip-dot dot-processing" aria-hidden="true" />
                  <span>Processing</span>
                </div>
                <span className="admin-chip-count">{pipelineStats.processing}</span>
              </Link>

              <Link to="/admin/orders?status=shipped" className="admin-pipeline-chip">
                <div className="admin-chip-left">
                  <span className="admin-chip-dot dot-shipped" aria-hidden="true" />
                  <span>Shipped</span>
                </div>
                <span className="admin-chip-count">{pipelineStats.shipped}</span>
              </Link>

              <Link to="/admin/orders?status=delivered" className="admin-pipeline-chip">
                <div className="admin-chip-left">
                  <span className="admin-chip-dot dot-delivered" aria-hidden="true" />
                  <span>Delivered</span>
                </div>
                <span className="admin-chip-count">{pipelineStats.delivered}</span>
              </Link>

              <Link to="/admin/orders?status=cancelled" className="admin-pipeline-chip">
                <div className="admin-chip-left">
                  <span className="admin-chip-dot dot-cancelled" aria-hidden="true" />
                  <span>Cancelled</span>
                </div>
                <span className="admin-chip-count">{pipelineStats.cancelled}</span>
              </Link>
            </div>
          </section>

          {/* 5. SIDE-BY-SIDE ACTIVITY GRID */}
          <div className="admin-activity-split">
            {/* LEFT COLUMN: RECENT STORE ORDERS */}
            <div className="admin-activity-main-col">
              <section className="admin-dashboard-card" aria-label="Recent Store Orders">
                <div className="admin-card-head">
                  <div className="admin-card-title-group">
                    <h2 className="admin-card-title">Recent Store Orders</h2>
                    <span className="admin-count-pill">{recentOrders.length} latest</span>
                  </div>
                  <Link to="/admin/orders" className="admin-card-action-link">
                    View all orders ({summaryData.totalOrders || 0}) →
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="admin-empty-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ color: '#71717a', marginBottom: '0.75rem' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </div>
                    <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>No orders placed in store yet.</p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-clean-table">
                      <thead>
                        <tr>
                          <th scope="col">Order ID</th>
                          <th scope="col">Customer</th>
                          <th scope="col">Items</th>
                          <th scope="col">Total</th>
                          <th scope="col">Status</th>
                          <th scope="col" style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.orderId}>
                            <td>
                              <Link
                                to={`/admin/orders/${order.orderId}`}
                                className="admin-order-id-badge"
                                title="View order details"
                              >
                                #{order.orderId}
                              </Link>
                              <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '2px' }}>
                                {formatDate(order.createdAt)}
                              </div>
                            </td>
                            <td>
                              <div className="admin-order-customer">
                                <span className="admin-customer-primary">{order.customerName}</span>
                                <span className="admin-customer-secondary">{order.customerEmail}</span>
                              </div>
                            </td>
                            <td>
                              <span className="admin-item-pill">
                                {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#ffffff', fontFamily: 'inherit' }}>
                                {formatCurrency(order.total)}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${getStatusPillClass(order.status)}`}>
                                <span className="status-pill-dot" aria-hidden="true" />
                                {order.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
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
            </div>

            {/* RIGHT COLUMN: ACTION ITEMS & RECENT SIGNUPS */}
            <div className="admin-activity-side-col">
              {/* WIDGET 1: INQUIRIES NEEDING ATTENTION */}
              <section className="admin-dashboard-card" aria-label="Inquiries Needing Attention">
                <div className="admin-card-head">
                  <div className="admin-card-title-group">
                    <h2 className="admin-card-title">Inquiries & Quotes</h2>
                    {totalPendingInquiries > 0 ? (
                      <span className="admin-count-pill admin-count-pill-warning">
                        {totalPendingInquiries} pending
                      </span>
                    ) : (
                      <span className="admin-count-pill">0 pending</span>
                    )}
                  </div>
                  <Link to="/admin/custom-requests" className="admin-card-action-link">
                    All →
                  </Link>
                </div>

                {recentRequests.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#71717a' }}>
                    <p style={{ fontSize: '0.85rem' }}>No pending requests. All inquiries are addressed!</p>
                  </div>
                ) : (
                  <div className="admin-inquiry-list">
                    {recentRequests.slice(0, 4).map((req) => (
                      <div key={req.requestId} className="admin-inquiry-item">
                        <div className="admin-inquiry-top">
                          <span
                            className={`admin-inquiry-type-badge ${
                              req.requestType === 'custom_apparel'
                                ? 'badge-custom-apparel'
                                : 'badge-corporate-branding'
                            }`}
                          >
                            {req.requestType === 'custom_apparel' ? 'Custom Apparel' : 'Corporate'}
                          </span>
                          <span className={`status-pill ${getStatusPillClass(req.status)}`}>
                            <span className="status-pill-dot" aria-hidden="true" />
                            {req.status}
                          </span>
                        </div>

                        <div>
                          <div className="admin-inquiry-name">{req.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#71717a' }}>{req.email}</div>
                        </div>

                        {req.detail && (
                          <div className="admin-inquiry-detail">
                            {req.detail}
                          </div>
                        )}

                        <div className="admin-inquiry-footer">
                          <span className="admin-inquiry-date">{formatDate(req.createdAt)}</span>
                          <Link
                            to={
                              req.requestType === 'custom_apparel'
                                ? '/admin/custom-requests'
                                : '/admin/business-requests'
                            }
                            className="admin-kpi-link"
                          >
                            Review Request →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* WIDGET 2: RECENT CUSTOMER SIGNUPS */}
              <section className="admin-dashboard-card" aria-label="Recent Customers">
                <div className="admin-card-head">
                  <div className="admin-card-title-group">
                    <h2 className="admin-card-title">Newest Customers</h2>
                    <span className="admin-count-pill">{recentCustomers.length}</span>
                  </div>
                  <Link to="/admin/customers" className="admin-card-action-link">
                    View directory →
                  </Link>
                </div>

                {recentCustomers.length === 0 ? (
                  <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: '#71717a' }}>
                    <p style={{ fontSize: '0.85rem' }}>No customer accounts registered yet.</p>
                  </div>
                ) : (
                  <div className="admin-customer-mini-list">
                    {recentCustomers.slice(0, 5).map((cust) => {
                      const initial = cust.firstName ? cust.firstName.charAt(0).toUpperCase() : 'C'
                      return (
                        <Link
                          key={cust.userId}
                          to={`/admin/customers/${cust.userId}`}
                          className="admin-customer-mini-item"
                          title="View customer profile"
                        >
                          <div className="admin-customer-mini-left">
                            <div className="admin-customer-avatar-sm" aria-hidden="true">
                              {initial}
                            </div>
                            <div className="admin-customer-mini-info">
                              <span className="admin-customer-mini-name">
                                {cust.firstName} {cust.lastName}
                              </span>
                              <span className="admin-customer-mini-email">{cust.email}</span>
                            </div>
                          </div>
                          <span className="admin-customer-mini-date">
                            {formatDate(cust.createdAt)}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* WIDGET 3: STORE OPERATIONAL STATUS & POLICIES */}
              <div className="admin-health-box">
                <div className="admin-health-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Store Operational Status</span>
                </div>

                <div className="admin-health-list">
                  <div className="admin-health-item">
                    <div className="admin-health-icon">✓</div>
                    <span>
                      <strong style={{ color: '#ffffff' }}>Free Shipping Active:</strong> ₹0 shipping applied storewide.
                    </span>
                  </div>

                  <div className="admin-health-item">
                    <div className="admin-health-icon">✓</div>
                    <span>
                      <strong style={{ color: '#ffffff' }}>Razorpay Gateway:</strong> Test/Live integration active.
                    </span>
                  </div>

                  <div className="admin-health-item">
                    <div className="admin-health-icon">✓</div>
                    <span>
                      <strong style={{ color: '#ffffff' }}>Frictionless Checkout:</strong> Instant password auth active.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
