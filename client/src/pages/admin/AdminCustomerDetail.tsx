import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  fetchAdminCustomerById,
  fetchAdminCustomerOrders,
  updateAdminCustomer,
  type AdminCustomerAccount,
  type AdminOrder,
} from '../../services/adminApi'
import '../../styles/Admin.css'

export const AdminCustomerDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()

  const [customer, setCustomer] = useState<AdminCustomerAccount | null>(null)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Edit Profile State
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editFirstName, setEditFirstName] = useState<string>('')
  const [editLastName, setEditLastName] = useState<string>('')
  const [editPhone, setEditPhone] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const loadCustomerData = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [custRes, ordersRes] = await Promise.all([
        fetchAdminCustomerById(userId),
        fetchAdminCustomerOrders(userId),
      ])

      setCustomer(custRes.customer)
      setOrders(ordersRes.orders || [])
      setEditFirstName(custRes.customer.firstName)
      setEditLastName(custRes.customer.lastName)
      setEditPhone(custRes.customer.phone || '')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load customer profile.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadCustomerData()
  }, [loadCustomerData])

  const handleStartEdit = () => {
    if (!customer) return
    setEditFirstName(customer.firstName)
    setEditLastName(customer.lastName)
    setEditPhone(customer.phone || '')
    setSaveError(null)
    setSaveSuccess(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (!customer) return
    setEditFirstName(customer.firstName)
    setEditLastName(customer.lastName)
    setEditPhone(customer.phone || '')
    setSaveError(null)
    setIsEditing(false)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    setSaveError(null)
    setSaveSuccess(null)

    if (!editFirstName.trim()) {
      setSaveError('First name cannot be empty.')
      return
    }

    if (!editLastName.trim()) {
      setSaveError('Last name cannot be empty.')
      return
    }

    setIsSaving(true)

    try {
      const res = await updateAdminCustomer(customer.userId, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        phone: editPhone.trim(),
      })

      setCustomer(res.customer)
      setSaveSuccess('Customer profile updated successfully!')
      setIsEditing(false)

      setTimeout(() => {
        setSaveSuccess(null)
      }, 3500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update customer profile.'
      setSaveError(msg)
    } finally {
      setIsSaving(false)
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
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

  // Calculated Order Summary Metrics
  const orderSummary = useMemo(() => {
    const totalOrders = orders.length
    const totalSpent = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0)

    const lastOrder = orders.length > 0 ? orders[0] : null
    const currentStatus = lastOrder ? lastOrder.status : 'None'

    return {
      totalOrders,
      totalSpent,
      lastOrderDate: lastOrder ? formatDate(lastOrder.createdAt) : 'None',
      lastOrderId: lastOrder ? lastOrder.orderId : null,
      currentStatus,
    }
  }, [orders])

  if (isLoading) {
    return (
      <div className="admin-page-container">
        <div className="admin-state-container">
          <div className="admin-spinner" aria-hidden="true" />
          <p className="admin-state-text">Loading customer account and order history...</p>
        </div>
      </div>
    )
  }

  if (errorMessage || !customer) {
    return (
      <div className="admin-page-container">
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage || 'Customer not found.'}</p>
          <div className="admin-btn-group">
            <button type="button" className="admin-btn admin-btn-primary" onClick={loadCustomerData}>
              Retry
            </button>
            <Link to="/admin/customers" className="admin-btn admin-btn-secondary">
              Back to Customers List
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page-container">
      {/* Top Breadcrumb Back Link */}
      <div className="admin-detail-breadcrumb">
        <Link to="/admin" className="admin-back-link">
          ← Back to Dashboard
        </Link>
        <span className="text-muted" style={{ margin: '0 0.5rem' }}>|</span>
        <Link to="/admin/customers" className="admin-back-link">
          Customers List
        </Link>
      </div>

      {/* Header */}
      <header className="admin-detail-header">
        <div>
          <h1 className="admin-page-title">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="admin-page-subtitle">
            Customer Profile & Order History
          </p>
        </div>

        <div>
          {!isEditing && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={handleStartEdit}
            >
              Edit Profile
            </button>
          )}
        </div>
      </header>

      {/* Feedback Alerts */}
      {saveSuccess && (
        <div className="admin-feedback-alert feedback-success" role="alert">
          {saveSuccess}
        </div>
      )}
      {saveError && (
        <div className="admin-feedback-alert feedback-error" role="alert">
          {saveError}
        </div>
      )}

      {/* 2-COLUMN GRID: CUSTOMER INFO & ORDER SUMMARY */}
      <div className="admin-detail-grid">
        {/* SECTION 1: CUSTOMER */}
        <div className="admin-clean-card-section">
          <h2 className="admin-section-title">CUSTOMER</h2>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="admin-action-form">
              <div className="admin-form-group">
                <label htmlFor="cust-first-name" className="admin-form-label">
                  First Name <span className="text-danger">*</span>
                </label>
                <input
                  id="cust-first-name"
                  type="text"
                  className="admin-form-input"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="cust-last-name" className="admin-form-label">
                  Last Name <span className="text-danger">*</span>
                </label>
                <input
                  id="cust-last-name"
                  type="text"
                  className="admin-form-input"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="cust-phone" className="admin-form-label">
                  Phone Number
                </label>
                <input
                  id="cust-phone"
                  type="text"
                  className="admin-form-input font-mono"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  disabled={isSaving}
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="admin-btn-group" style={{ marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="admin-customer-info-list">
              <div className="admin-info-row">
                <span className="admin-info-label">Name</span>
                <span className="admin-info-value text-bold">
                  {customer.firstName} {customer.lastName}
                </span>
              </div>
              <div className="admin-info-row">
                <span className="admin-info-label">Email</span>
                <span className="admin-info-value font-mono">{customer.email}</span>
              </div>
              <div className="admin-info-row">
                <span className="admin-info-label">Phone</span>
                <span className="admin-info-value font-mono">
                  {customer.phone || 'No phone registered'}
                </span>
              </div>
              <div className="admin-info-row">
                <span className="admin-info-label">Joined date</span>
                <span className="admin-info-value">{formatDate(customer.createdAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: ORDER SUMMARY */}
        <div className="admin-clean-card-section">
          <h2 className="admin-section-title">ORDER SUMMARY</h2>

          <div className="admin-customer-info-list">
            <div className="admin-info-row">
              <span className="admin-info-label">Total orders</span>
              <span className="admin-info-value text-bold">
                {orderSummary.totalOrders} {orderSummary.totalOrders === 1 ? 'order' : 'orders'}
              </span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-label">Total spent</span>
              <span className="admin-info-value font-mono text-bold text-accent">
                {formatPrice(orderSummary.totalSpent)}
              </span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-label">Last order</span>
              <span className="admin-info-value">
                {orderSummary.lastOrderId ? (
                  <>
                    {orderSummary.lastOrderDate}{' '}
                    <span className="text-muted font-mono text-sm">({orderSummary.lastOrderId})</span>
                  </>
                ) : (
                  'None'
                )}
              </span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-label">Current order status</span>
              <span className="admin-info-value">
                {orderSummary.currentStatus !== 'None' ? (
                  <span className={getStatusBadgeClass(orderSummary.currentStatus)}>
                    {orderSummary.currentStatus.toUpperCase()}
                  </span>
                ) : (
                  <span className="text-muted">No orders</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: RECENT ORDERS */}
      <section className="admin-dashboard-section" style={{ marginTop: '2rem' }} aria-label="Recent Orders">
        <div className="admin-section-header-flex">
          <div>
            <h2 className="admin-dashboard-section-title">RECENT ORDERS</h2>
            <p className="admin-dashboard-section-desc">
              All orders placed by this customer.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="admin-empty-card">
            <p>This customer has not placed any orders yet.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Order ID</th>
                  <th scope="col">Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.orderId}>
                    <td>
                      <span className="font-mono text-bold">{ord.orderId}</span>
                    </td>
                    <td>
                      <span className="text-muted text-sm">{formatDate(ord.createdAt)}</span>
                    </td>
                    <td>
                      <span className="font-mono text-bold">{formatPrice(ord.pricing.total)}</span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(ord.status)}>
                        {ord.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/admin/orders/${ord.orderId}`}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        aria-label={`View order ${ord.orderId}`}
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
  )
}

export default AdminCustomerDetail
