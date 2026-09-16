import React, { useState, useEffect, useCallback } from 'react'
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

  // Edit Mode State
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
        <Link to="/admin/customers" className="admin-back-link">
          ← Back to Customers List
        </Link>
      </div>

      {/* Header */}
      <header className="admin-detail-header">
        <div>
          <div className="admin-detail-title-row">
            <h1 className="admin-page-title">
              Customer: {customer.firstName} {customer.lastName}
            </h1>
            <span className="status-badge status-info">
              {(customer.role || 'customer').toUpperCase()}
            </span>
          </div>
          <p className="admin-page-subtitle">
            User ID: <span className="font-mono">{customer.userId}</span> • Member since {formatDate(customer.createdAt)}
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

      {/* Success / Error Feedback */}
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

      {/* Grid: Profile Left, Order Summary / History Right */}
      <div className="admin-detail-grid">
        {/* Left Column: Profile Card */}
        <div className="admin-card-section">
          <h2 className="admin-section-title">Customer Profile</h2>

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

              {/* Locked/Read-only Fields */}
              <div className="admin-form-group">
                <span className="admin-form-label">Email Address (Locked)</span>
                <input
                  type="text"
                  className="admin-form-input font-mono"
                  value={customer.email}
                  disabled
                  readOnly
                  title="Customer email addresses cannot be modified through this interface."
                />
                <span className="admin-form-hint">Email is locked to protect customer authentication integrity.</span>
              </div>

              <div className="admin-form-group">
                <span className="admin-form-label">User ID (Locked)</span>
                <input
                  type="text"
                  className="admin-form-input font-mono"
                  value={customer.userId}
                  disabled
                  readOnly
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
            <div className="admin-detail-specs">
              <div className="spec-group">
                <span className="spec-label">Full Name</span>
                <span className="spec-value text-white font-medium">
                  {customer.firstName} {customer.lastName}
                </span>
              </div>
              <div className="spec-group">
                <span className="spec-label">Email Address</span>
                <span className="spec-value font-mono text-white">{customer.email}</span>
              </div>
              <div className="spec-group">
                <span className="spec-label">Phone</span>
                <span className="spec-value font-mono">
                  {customer.phone || 'No phone registered'}
                </span>
              </div>
              <div className="spec-group">
                <span className="spec-label">Account User ID</span>
                <span className="spec-value font-mono text-muted">{customer.userId}</span>
              </div>
              <div className="spec-group">
                <span className="spec-label">Account Role</span>
                <span className="spec-value">{customer.role || 'customer'}</span>
              </div>
              <div className="spec-group">
                <span className="spec-label">Registration Date</span>
                <span className="spec-value">{formatDate(customer.createdAt)}</span>
              </div>
              <div className="spec-group">
                <span className="spec-label">Lifetime Order Volume</span>
                <span className="spec-value text-white font-bold">
                  {customer.orderCount} {customer.orderCount === 1 ? 'Order' : 'Orders'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order History */}
        <div className="admin-card-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="admin-section-title" style={{ margin: 0 }}>
              Order History ({orders.length})
            </h2>
            <span className="admin-category-badge">
              {orders.length} Total
            </span>
          </div>

          {orders.length === 0 ? (
            <p className="text-muted" style={{ padding: '1rem 0' }}>
              This customer has not placed any orders yet.
            </p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.orderId}>
                      <td className="font-mono text-white">{ord.orderId}</td>
                      <td className="text-muted text-sm">{formatDate(ord.createdAt)}</td>
                      <td className="text-sm">
                        {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="font-medium text-white">{formatPrice(ord.pricing.total)}</td>
                      <td>
                        <span className={getStatusBadgeClass(ord.status)}>
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link
                          to={`/admin/orders/${ord.orderId}`}
                          className="admin-btn-action"
                          aria-label={`View order ${ord.orderId}`}
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
        </div>
      </div>
    </div>
  )
}

export default AdminCustomerDetail
