import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminAnalytics,
  type AdminAnalyticsResponse,
  type AdminDailySalesItem,
} from '../../services/adminApi'
import '../../styles/Admin.css'

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await fetchAdminAnalytics()
      setAnalytics(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load analytics.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Currency & Number formatters using Indian numbering system
  const formatCurrency = useCallback((val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0)
  }, [])

  const formatNumber = useCallback((val: number) => {
    return new Intl.NumberFormat('en-IN').format(val || 0)
  }, [])

  const formatDateShort = (dateStr: string) => {
    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  // 30-Day SVG Chart Calculations
  const chartMetrics = useMemo(() => {
    if (!analytics?.dailySales || analytics.dailySales.length === 0) {
      return {
        points: '',
        areaPoints: '',
        maxRev: 1,
        total30DayRevenue: 0,
        total30DayOrders: 0,
        coords: [] as { x: number; y: number; item: AdminDailySalesItem }[],
      }
    }

    const days = analytics.dailySales
    const revenues = days.map((d) => d.revenue)
    const maxRev = Math.max(...revenues, 1000) // minimum ceiling for aesthetics
    const total30DayRevenue = revenues.reduce((a, b) => a + b, 0)
    const total30DayOrders = days.reduce((a, b) => a + b.orders, 0)

    const width = 800
    const height = 220
    const padTop = 20
    const padBottom = 30
    const padX = 20
    const usableWidth = width - padX * 2
    const usableHeight = height - padTop - padBottom

    const step = days.length > 1 ? usableWidth / (days.length - 1) : usableWidth

    const coords = days.map((item, idx) => {
      const x = padX + idx * step
      const ratio = item.revenue / maxRev
      const y = height - padBottom - ratio * usableHeight
      return { x, y, item }
    })

    const points = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
    const firstX = coords[0]?.x.toFixed(1) || padX
    const lastX = coords[coords.length - 1]?.x.toFixed(1) || width - padX
    const groundY = (height - padBottom).toFixed(1)
    const areaPoints = `${firstX},${groundY} ${points} ${lastX},${groundY}`

    return { points, areaPoints, maxRev, total30DayRevenue, total30DayOrders, coords }
  }, [analytics?.dailySales])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'confirmed':
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

  const getCategoryThemeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'streetwear':
        return '#f97316' // Vibrant KALA orange
      case 'gaming':
        return '#06b6d4' // Cyber cyan
      case 'gymwear':
        return '#10b981' // Performance green
      default:
        return '#8b5cf6'
    }
  }

  return (
    <div className="admin-page-container">
      {/* Top Header */}
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">KALA Analytics</h1>
          <p className="admin-page-subtitle">Business performance overview</p>
        </div>
        <div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={loadData}
            disabled={isLoading}
            aria-label="Refresh analytics data"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isLoading ? 'admin-spin' : ''}
              aria-hidden="true"
              style={{ marginRight: '0.5rem' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Loading State */}
      {isLoading && !analytics && (
        <div className="admin-state-container">
          <div className="admin-spinner" aria-hidden="true" />
          <p className="admin-state-text">Loading analytics metrics from database...</p>
        </div>
      )}

      {/* Error State */}
      {errorMessage && !analytics && (
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage}</p>
          <button type="button" className="admin-btn admin-btn-primary" onClick={loadData}>
            Retry
          </button>
        </div>
      )}

      {/* Loaded Dashboard Content */}
      {analytics && (
        <div className="admin-analytics-dashboard">
          {/* SECTION 1: BUSINESS OVERVIEW METRIC CARDS */}
          <section aria-labelledby="analytics-overview-heading">
            <h2 id="analytics-overview-heading" className="sr-only">
              Business Overview Metrics
            </h2>
            <div className="admin-analytics-metrics-grid">
              {/* Card 1: Total Revenue */}
              <div className="admin-metric-card highlight-revenue">
                <span className="admin-metric-label">Total Revenue</span>
                <span className="admin-metric-value text-white">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </span>
                <span className="admin-metric-sub">Lifetime non-cancelled sales</span>
              </div>

              {/* Card 2: Total Orders */}
              <div className="admin-metric-card">
                <span className="admin-metric-label">Total Orders</span>
                <span className="admin-metric-value">
                  {formatNumber(analytics.overview.totalOrders)}
                </span>
                <span className="admin-metric-sub">
                  Across all fulfillment stages
                </span>
              </div>

              {/* Card 3: Customers */}
              <div className="admin-metric-card">
                <span className="admin-metric-label">Customers</span>
                <span className="admin-metric-value">
                  {formatNumber(analytics.overview.totalCustomers)}
                </span>
                <span className="admin-metric-sub">Registered accounts</span>
              </div>

              {/* Card 4: Products */}
              <div className="admin-metric-card">
                <span className="admin-metric-label">Products</span>
                <span className="admin-metric-value">
                  {formatNumber(analytics.overview.totalProducts)}
                </span>
                <span className="admin-metric-sub">Catalog items</span>
              </div>

              {/* Card 5: Average Order Value */}
              <div className="admin-metric-card">
                <span className="admin-metric-label">Average Order Value</span>
                <span className="admin-metric-value">
                  {formatCurrency(analytics.overview.averageOrderValue)}
                </span>
                <span className="admin-metric-sub">Per active order</span>
              </div>

              {/* Card 6: Delivered Revenue */}
              <div className="admin-metric-card">
                <span className="admin-metric-label">Delivered Revenue</span>
                <span className="admin-metric-value text-success">
                  {formatCurrency(analytics.overview.deliveredRevenue)}
                </span>
                <span className="admin-metric-sub">Fulfilled & completed</span>
              </div>
            </div>
          </section>

          {/* SECTION 2: 30-DAY SALES CHART */}
          <section className="admin-card-section" aria-labelledby="sales-chart-heading">
            <div className="admin-chart-header">
              <div>
                <h2 id="sales-chart-heading" className="admin-section-title" style={{ margin: 0 }}>
                  Sales Overview (Last 30 Days)
                </h2>
                <p className="admin-page-subtitle" style={{ margin: '0.25rem 0 0 0' }}>
                  Continuous revenue timeline across the past 30 calendar days
                </p>
              </div>
              <div className="admin-chart-summary-badge">
                <span>30-Day Volume: </span>
                <strong className="text-white">
                  {formatCurrency(chartMetrics.total30DayRevenue)}
                </strong>
                <span className="text-muted font-mono">
                  {' '}
                  ({chartMetrics.total30DayOrders} {chartMetrics.total30DayOrders === 1 ? 'order' : 'orders'})
                </span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="admin-svg-chart-wrapper" onMouseLeave={() => setHoveredIndex(null)}>
              <svg
                className="admin-svg-chart"
                viewBox="0 0 800 220"
                preserveAspectRatio="none"
                aria-label="30-day sales timeline line chart"
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.38" />
                    <stop offset="90%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="20" y1="30" x2="780" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="20" y1="85" x2="780" y2="85" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="20" y1="140" x2="780" y2="140" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="20" y1="190" x2="780" y2="190" stroke="rgba(255,255,255,0.12)" />

                {/* Area under curve */}
                {chartMetrics.areaPoints && (
                  <polygon points={chartMetrics.areaPoints} fill="url(#revenueGradient)" />
                )}

                {/* Stroke line */}
                {chartMetrics.points && (
                  <polyline
                    points={chartMetrics.points}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive points & hover columns */}
                {chartMetrics.coords.map((c, idx) => (
                  <g key={c.item.date}>
                    {/* Hover hotspot column */}
                    <rect
                      x={c.x - 12}
                      y="10"
                      width="24"
                      height="180"
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseOver={() => setHoveredIndex(idx)}
                    />
                    {/* Data circle */}
                    {(c.item.revenue > 0 || hoveredIndex === idx) && (
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={hoveredIndex === idx ? '5.5' : '3'}
                        fill={hoveredIndex === idx ? '#ffffff' : '#f97316'}
                        stroke="#09090b"
                        strokeWidth="2"
                      />
                    )}
                    {/* Vertical indicator line if hovered */}
                    {hoveredIndex === idx && (
                      <line
                        x1={c.x}
                        y1="20"
                        x2={c.x}
                        y2="190"
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeDasharray="2 2"
                        pointerEvents="none"
                      />
                    )}
                    {/* Selected X-axis date labels (every 5-7 days and last day) */}
                    {(idx === 0 || idx === 7 || idx === 15 || idx === 22 || idx === chartMetrics.coords.length - 1) && (
                      <text
                        x={c.x}
                        y="208"
                        textAnchor="middle"
                        fill="#71717a"
                        fontSize="10"
                        fontFamily="inherit"
                      >
                        {formatDateShort(c.item.date)}
                      </text>
                    )}
                  </g>
                ))}
              </svg>

              {/* Floating Tooltip */}
              {hoveredIndex !== null && chartMetrics.coords[hoveredIndex] && (
                <div
                  className="admin-chart-tooltip-floating"
                  style={{
                    left: `${(chartMetrics.coords[hoveredIndex].x / 800) * 100}%`,
                    top: `${Math.max(15, chartMetrics.coords[hoveredIndex].y - 15)}px`,
                  }}
                  role="tooltip"
                >
                  <div className="tooltip-date font-mono">{chartMetrics.coords[hoveredIndex].item.date}</div>
                  <div className="tooltip-rev text-white font-bold">
                    Revenue: {formatCurrency(chartMetrics.coords[hoveredIndex].item.revenue)}
                  </div>
                  <div className="tooltip-ord text-muted">
                    {chartMetrics.coords[hoveredIndex].item.orders}{' '}
                    {chartMetrics.coords[hoveredIndex].item.orders === 1 ? 'order' : 'orders'}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 3: TWO-COLUMN GRID (ORDER STATUS & SALES BY CATEGORY) */}
          <div className="admin-analytics-two-col">
            {/* Column A: Order Status Distribution */}
            <div className="admin-card-section">
              <h2 className="admin-section-title">Order Status Distribution</h2>
              <p className="admin-page-subtitle" style={{ marginBottom: '1.25rem' }}>
                Total lifecycle progress for {analytics.overview.totalOrders} recorded orders
              </p>

              <div className="admin-status-breakdown-list">
                {[
                  { key: 'pending', label: 'Pending', count: analytics.ordersByStatus.pending },
                  { key: 'confirmed', label: 'Confirmed', count: analytics.ordersByStatus.confirmed },
                  { key: 'processing', label: 'Processing', count: analytics.ordersByStatus.processing },
                  { key: 'shipped', label: 'Shipped', count: analytics.ordersByStatus.shipped },
                  { key: 'delivered', label: 'Delivered', count: analytics.ordersByStatus.delivered },
                  { key: 'cancelled', label: 'Cancelled', count: analytics.ordersByStatus.cancelled },
                ].map((item) => {
                  const pct =
                    analytics.overview.totalOrders > 0
                      ? Math.round((item.count / analytics.overview.totalOrders) * 100)
                      : 0

                  return (
                    <div key={item.key} className="admin-status-row">
                      <div className="admin-status-row-header">
                        <span className={getStatusBadge(item.key)}>
                          {item.label.toUpperCase()}
                        </span>
                        <div className="admin-status-counts font-mono">
                          <strong className="text-white">{item.count}</strong>
                          <span className="text-muted"> ({pct}%)</span>
                        </div>
                      </div>
                      <div className="admin-progress-track">
                        <div
                          className={`admin-progress-fill fill-${item.key}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Column B: Sales by Category */}
            <div className="admin-card-section">
              <h2 className="admin-section-title">Sales by Category</h2>
              <p className="admin-page-subtitle" style={{ marginBottom: '1.25rem' }}>
                Revenue distribution across primary KALA luxury apparel collections
              </p>

              <div className="admin-category-cards-list">
                {analytics.salesByCategory.map((cat) => {
                  const totalCatRev = analytics.salesByCategory.reduce((sum, c) => sum + c.revenue, 0)
                  const pct = totalCatRev > 0 ? Math.round((cat.revenue / totalCatRev) * 100) : 0
                  const themeColor = getCategoryThemeColor(cat.category)

                  return (
                    <div key={cat.category} className="admin-category-metric-card">
                      <div className="admin-category-card-top">
                        <div className="category-title-wrap">
                          <span
                            className="category-color-dot"
                            style={{ backgroundColor: themeColor }}
                          />
                          <h3 className="category-title text-white">{cat.category}</h3>
                        </div>
                        <span className="category-rev font-mono font-bold text-white">
                          {formatCurrency(cat.revenue)}
                        </span>
                      </div>

                      <div className="admin-progress-track" style={{ margin: '0.6rem 0' }}>
                        <div
                          className="admin-progress-fill"
                          style={{ width: `${pct}%`, backgroundColor: themeColor }}
                        />
                      </div>

                      <div className="admin-category-card-footer text-muted font-mono text-sm">
                        <span>{pct}% of sales</span>
                        <span>
                          {cat.orders} {cat.orders === 1 ? 'order' : 'orders'} • {cat.itemsSold} items sold
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* SECTION 4: TWO-COLUMN GRID (TOP PRODUCTS & REQUESTS OVERVIEW) */}
          <div className="admin-analytics-two-col">
            {/* Top Products */}
            <div className="admin-card-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h2 className="admin-section-title" style={{ margin: 0 }}>
                    Top Products
                  </h2>
                  <p className="admin-page-subtitle" style={{ margin: '0.25rem 0 0 0' }}>
                    Ranked by historical revenue generation
                  </p>
                </div>
                <Link to="/admin/products" className="admin-back-link text-sm">
                  View Catalog →
                </Link>
              </div>

              {analytics.topProducts.length === 0 ? (
                <p className="text-muted" style={{ padding: '1rem 0' }}>
                  No product sales recorded yet.
                </p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '45px' }}>#</th>
                        <th>Product</th>
                        <th>Orders</th>
                        <th>Sold</th>
                        <th className="text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topProducts.map((prod, idx) => (
                        <tr key={prod.productId}>
                          <td>
                            <span className="admin-rank-badge font-mono">#{idx + 1}</span>
                          </td>
                          <td>
                            <div className="admin-product-cell-main">
                              <span className="admin-product-name-text text-white font-medium">
                                {prod.productName}
                              </span>
                              <span className="admin-product-id-sub font-mono text-xs">
                                {prod.productId}
                              </span>
                            </div>
                          </td>
                          <td className="font-mono">{prod.orders}</td>
                          <td className="font-mono">{prod.itemsSold}</td>
                          <td className="text-right font-mono font-bold text-white">
                            {formatCurrency(prod.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Request Overview & Secondary Revenue Breakout */}
            <div className="admin-card-section">
              <h2 className="admin-section-title">Inquiries & Financial Status</h2>
              <p className="admin-page-subtitle" style={{ marginBottom: '1.25rem' }}>
                Pipeline inquiries and pending vs. cancelled order value
              </p>

              {/* Requests summary */}
              <div className="admin-requests-grid">
                <Link to="/admin/custom-requests" className="admin-request-metric-card">
                  <span className="request-card-label">Custom Apparel Requests</span>
                  <span className="request-card-value text-white font-mono">
                    {formatNumber(analytics.requests.customApparel)}
                  </span>
                  <span className="request-card-link text-xs">Review submissions →</span>
                </Link>

                <Link to="/admin/business-requests" className="admin-request-metric-card">
                  <span className="request-card-label">Business Branding Quotes</span>
                  <span className="request-card-value text-white font-mono">
                    {formatNumber(analytics.requests.businessBranding)}
                  </span>
                  <span className="request-card-link text-xs">Review corporate briefs →</span>
                </Link>
              </div>

              {/* Revenue Pipeline Breakout */}
              <div className="admin-revenue-breakout-box" style={{ marginTop: '1.5rem' }}>
                <h3 className="admin-form-label" style={{ marginBottom: '0.75rem' }}>
                  Pipeline Revenue Balance
                </h3>
                <div className="admin-detail-specs" style={{ gap: '0.75rem' }}>
                  <div className="spec-group">
                    <span className="spec-label">Pending Order Value</span>
                    <span className="spec-value font-mono text-warning">
                      {formatCurrency(analytics.overview.pendingRevenue)}
                    </span>
                  </div>
                  <div className="spec-group">
                    <span className="spec-label">Fulfilled Delivered Value</span>
                    <span className="spec-value font-mono text-success">
                      {formatCurrency(analytics.overview.deliveredRevenue)}
                    </span>
                  </div>
                  <div className="spec-group">
                    <span className="spec-label">Cancelled / Voided Value</span>
                    <span className="spec-value font-mono text-danger">
                      {formatCurrency(analytics.overview.cancelledRevenue)}
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

export default AdminAnalytics
