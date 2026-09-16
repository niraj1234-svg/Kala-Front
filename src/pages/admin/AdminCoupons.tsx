import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  type AdminCoupon,
  type AdminDiscountType,
  type AdminCouponStatus,
  type AdminCouponCreateInput,
  type AdminCouponUpdateInput,
} from '../../services/adminApi'
import '../../styles/Admin.css'

interface FormState {
  code: string
  description: string
  discountType: AdminDiscountType
  discountValue: string
  minimumOrderValue: string
  maximumDiscount: string
  startDate: string
  expiryDate: string
  usageLimit: string
  perCustomerLimit: string
  active: boolean
}

const INITIAL_FORM: FormState = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '10',
  minimumOrderValue: '0',
  maximumDiscount: '',
  startDate: '',
  expiryDate: '',
  usageLimit: '',
  perCustomerLimit: '1',
  active: true,
}

export const AdminCoupons: React.FC = () => {
  const navigate = useNavigate()

  // Coupon listing state
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(20)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCoupons, setTotalCoupons] = useState<number>(0)

  // Filters & Search
  const [search, setSearch] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null)
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Delete modal state
  const [deletingCoupon, setDeletingCoupon] = useState<AdminCoupon | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

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
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }, [])

  // Date input formatter for HTML date inputs (YYYY-MM-DD)
  const toInputDateFormat = (dateStr: string | Date): string => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(handler)
  }, [search])

  // Fetch Coupons from backend API
  const loadCoupons = useCallback(
    async (isManualRefresh = false): Promise<void> => {
      if (isManualRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setErrorMessage(null)

      try {
        const res = await fetchAdminCoupons({
          page,
          limit,
          search: debouncedSearch,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          discountType: typeFilter !== 'all' ? typeFilter : undefined,
        })

        if (res && res.success) {
          setCoupons(res.coupons || [])
          setTotalCoupons(res.pagination.total)
          setTotalPages(res.pagination.pages || 1)
        } else {
          setErrorMessage('Unable to load coupons.')
        }
      } catch (err: unknown) {
        console.error('Error fetching admin coupons:', err)
        if (err instanceof Error && err.message.includes('expired')) {
          navigate('/admin/login', { replace: true })
          return
        }
        setErrorMessage('Unable to load coupons.')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [page, limit, debouncedSearch, statusFilter, typeFilter, navigate]
  )

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  // Status Badge Class
  const getStatusBadgeClass = (status: AdminCouponStatus): string => {
    switch (status) {
      case 'active':
        return 'status-badge-delivered' // green
      case 'scheduled':
        return 'status-badge-confirmed' // blue
      case 'expired':
        return 'status-badge-cancelled' // gray/muted
      case 'disabled':
        return 'status-badge-pending' // warning/orange
      case 'exhausted':
        return 'status-badge-cancelled' // red
      default:
        return 'status-badge-pending'
    }
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    const today = new Date()
    const defaultExpiry = new Date(today)
    defaultExpiry.setDate(defaultExpiry.getDate() + 30)

    setEditingCoupon(null)
    setFormState({
      ...INITIAL_FORM,
      startDate: toInputDateFormat(today),
      expiryDate: toInputDateFormat(defaultExpiry),
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon)
    setFormState({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumOrderValue: coupon.minimumOrderValue.toString(),
      maximumDiscount:
        coupon.maximumDiscount !== null && coupon.maximumDiscount !== undefined
          ? coupon.maximumDiscount.toString()
          : '',
      startDate: toInputDateFormat(coupon.startDate),
      expiryDate: toInputDateFormat(coupon.expiryDate),
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      perCustomerLimit: coupon.perCustomerLimit
        ? coupon.perCustomerLimit.toString()
        : '',
      active: coupon.active,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  // Handle Form Submission (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Basic client validations
    if (!editingCoupon) {
      const cleanCode = formState.code.trim().toUpperCase()
      if (!cleanCode) {
        setFormError('Coupon code is required.')
        return
      }
      if (!/^[A-Z0-9_-]{3,30}$/.test(cleanCode)) {
        setFormError(
          'Coupon code must be 3-30 uppercase alphanumeric characters, hyphens, or underscores.'
        )
        return
      }
    }

    const discountVal = Number(formState.discountValue)
    if (isNaN(discountVal) || discountVal <= 0) {
      setFormError('Please enter a valid discount value greater than 0.')
      return
    }
    if (formState.discountType === 'percentage' && discountVal > 100) {
      setFormError('Percentage discount cannot exceed 100%.')
      return
    }

    if (!formState.startDate || !formState.expiryDate) {
      setFormError('Both start date and expiry date are required.')
      return
    }
    if (new Date(formState.startDate) >= new Date(formState.expiryDate)) {
      setFormError('Expiry date must be after start date.')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingCoupon) {
        // Update Coupon
        const updatePayload: AdminCouponUpdateInput = {
          description: formState.description.trim(),
          discountType: formState.discountType,
          discountValue: discountVal,
          minimumOrderValue: formState.minimumOrderValue
            ? Math.max(0, Number(formState.minimumOrderValue))
            : 0,
          maximumDiscount:
            formState.discountType === 'percentage' && formState.maximumDiscount
              ? Math.max(0, Number(formState.maximumDiscount))
              : null,
          startDate: new Date(formState.startDate).toISOString(),
          expiryDate: new Date(formState.expiryDate).toISOString(),
          usageLimit: formState.usageLimit
            ? Math.max(1, Math.floor(Number(formState.usageLimit)))
            : null,
          perCustomerLimit: formState.perCustomerLimit
            ? Math.max(1, Math.floor(Number(formState.perCustomerLimit)))
            : null,
          active: formState.active,
        }

        const res = await updateAdminCoupon(editingCoupon._id, updatePayload)
        if (res.success) {
          setActionSuccessMessage(`Coupon "${editingCoupon.code}" updated successfully.`)
          setIsModalOpen(false)
          loadCoupons()
        } else {
          setFormError(res.message || 'Failed to update coupon.')
        }
      } else {
        // Create Coupon
        const createPayload: AdminCouponCreateInput = {
          code: formState.code.trim().toUpperCase(),
          description: formState.description.trim(),
          discountType: formState.discountType,
          discountValue: discountVal,
          minimumOrderValue: formState.minimumOrderValue
            ? Math.max(0, Number(formState.minimumOrderValue))
            : 0,
          maximumDiscount:
            formState.discountType === 'percentage' && formState.maximumDiscount
              ? Math.max(0, Number(formState.maximumDiscount))
              : null,
          startDate: new Date(formState.startDate).toISOString(),
          expiryDate: new Date(formState.expiryDate).toISOString(),
          usageLimit: formState.usageLimit
            ? Math.max(1, Math.floor(Number(formState.usageLimit)))
            : null,
          perCustomerLimit: formState.perCustomerLimit
            ? Math.max(1, Math.floor(Number(formState.perCustomerLimit)))
            : null,
          active: formState.active,
        }

        const res = await createAdminCoupon(createPayload)
        if (res.success) {
          setActionSuccessMessage(`Coupon "${createPayload.code}" created successfully.`)
          setIsModalOpen(false)
          loadCoupons()
        } else {
          setFormError(res.message || 'Failed to create coupon.')
        }
      }
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'An error occurred while saving coupon.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick Toggle Active/Disabled
  const handleToggleActive = async (coupon: AdminCoupon) => {
    try {
      const res = await updateAdminCoupon(coupon._id, { active: !coupon.active })
      if (res.success) {
        setActionSuccessMessage(
          `Coupon "${coupon.code}" ${coupon.active ? 'disabled' : 'activated'}.`
        )
        loadCoupons()
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to toggle coupon status.'
      )
    }
  }

  // Delete Coupon Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const res = await deleteAdminCoupon(deletingCoupon._id)
      if (res.success) {
        setActionSuccessMessage(`Coupon "${deletingCoupon.code}" deleted.`)
        setDeletingCoupon(null)
        loadCoupons()
      } else {
        setDeleteError(res.message || 'Failed to delete coupon.')
      }
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : 'Unable to delete coupon.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  // Auto-dismiss success notification
  useEffect(() => {
    if (actionSuccessMessage) {
      const timer = setTimeout(() => setActionSuccessMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [actionSuccessMessage])

  return (
    <div className="admin-page-container">
      {/* 1. HEADER */}
      <header className="admin-page-header">
        <div className="admin-page-header-left">
          <div className="admin-breadcrumb-badge">Marketing & Promotions</div>
          <h1 className="admin-page-title">KALA COUPONS</h1>
          <p className="admin-page-subtitle">
            Promotions, discount vouchers, and campaign management
          </p>
        </div>

        <div className="admin-page-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => loadCoupons(true)}
            disabled={isLoading || isRefreshing}
            aria-label="Refresh coupons list"
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

          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleOpenCreate}
            id="btn-create-coupon"
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
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Coupon</span>
          </button>
        </div>
      </header>

      {/* SUCCESS BANNER */}
      {actionSuccessMessage && (
        <div className="admin-success-banner" role="alert">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section className="admin-filter-bar" aria-label="Coupons filter and search">
        <div className="admin-search-wrapper">
          <svg
            className="admin-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search coupons"
          />
          {search && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="admin-filter-group">
          {/* Status filter */}
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            aria-label="Filter by coupon status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
            <option value="exhausted">Exhausted</option>
          </select>

          {/* Discount Type filter */}
          <select
            className="admin-filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPage(1)
            }}
            aria-label="Filter by discount type"
          >
            <option value="all">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
      </section>

      {/* 3. LOADING STATE */}
      {isLoading && coupons.length === 0 && (
        <div className="admin-state-container">
          <div className="admin-spinner" aria-hidden="true" />
          <p className="admin-state-text">Loading coupons from database...</p>
        </div>
      )}

      {/* 4. ERROR STATE */}
      {errorMessage && coupons.length === 0 && (
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage}</p>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => loadCoupons()}
          >
            Retry
          </button>
        </div>
      )}

      {/* 5. COUPONS TABLE */}
      {!isLoading && coupons.length === 0 && !errorMessage ? (
        <div className="admin-empty-card">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <p>
            {debouncedSearch || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No coupons match your filters.'
              : 'No coupons found.'}
          </p>
          <span className="admin-empty-sub">
            Create your first promotional discount coupon to get started.
          </span>
        </div>
      ) : (
        coupons.length > 0 && (
          <div className="admin-table-container">
            <table className="admin-table" aria-label="Coupons directory">
              <thead>
                <tr>
                  <th scope="col">Coupon Code</th>
                  <th scope="col">Discount</th>
                  <th scope="col">Min. Order</th>
                  <th scope="col">Max. Discount</th>
                  <th scope="col">Validity</th>
                  <th scope="col">Usage</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id}>
                    {/* Code & Description */}
                    <td>
                      <div>
                        <span className="admin-coupon-code-pill font-mono">
                          {coupon.code}
                        </span>
                        {coupon.description && (
                          <span className="admin-cell-sub">
                            {coupon.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Discount */}
                    <td>
                      <span className="text-bold text-white">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% OFF`
                          : `${formatCurrency(coupon.discountValue)} OFF`}
                      </span>
                    </td>

                    {/* Minimum Order */}
                    <td>
                      <span>
                        {coupon.minimumOrderValue > 0
                          ? `Min ${formatCurrency(coupon.minimumOrderValue)}`
                          : 'None'}
                      </span>
                    </td>

                    {/* Maximum Discount */}
                    <td>
                      <span>
                        {coupon.maximumDiscount
                          ? `Max ${formatCurrency(coupon.maximumDiscount)}`
                          : '—'}
                      </span>
                    </td>

                    {/* Validity */}
                    <td>
                      <div className="admin-validity-dates">
                        <span>{formatDate(coupon.startDate)}</span>
                        <span className="text-muted">to</span>
                        <span>{formatDate(coupon.expiryDate)}</span>
                      </div>
                    </td>

                    {/* Usage Redemptions */}
                    <td>
                      <div>
                        <span className="font-mono text-bold">
                          {coupon.usageCount} /{' '}
                          {coupon.usageLimit ? coupon.usageLimit : '∞'}
                        </span>
                        {coupon.perCustomerLimit && (
                          <span className="admin-cell-sub">
                            Max {coupon.perCustomerLimit}/cust
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          coupon.status
                        )}`}
                      >
                        {coupon.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="admin-actions-flex">
                        {/* Toggle Active Button */}
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                          onClick={() => handleToggleActive(coupon)}
                          title={coupon.active ? 'Disable Coupon' : 'Activate Coupon'}
                        >
                          {coupon.active ? 'Disable' : 'Enable'}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                          onClick={() => handleOpenEdit(coupon)}
                        >
                          Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => {
                            setDeletingCoupon(coupon)
                            setDeleteError(null)
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* 6. PAGINATION */}
      {totalPages > 1 && (
        <div className="admin-pagination-container">
          <span className="admin-pagination-info">
            Showing Page {page} of {totalPages} ({formatNumber(totalCoupons)}{' '}
            total coupons)
          </span>
          <div className="admin-pagination-buttons">
            <button
              type="button"
              className="admin-btn admin-btn-sm admin-btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-sm admin-btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 7. CREATE / EDIT MODAL DIALOG */}
      {isModalOpen && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
              </h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="admin-modal-error" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="admin-modal-form">
              {/* Row 1: Code & Description */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="coupon-code-input">
                    Coupon Code *
                  </label>
                  <input
                    id="coupon-code-input"
                    type="text"
                    className="admin-form-input font-mono"
                    placeholder="e.g. KALA20"
                    value={formState.code}
                    onChange={(e) =>
                      setFormState({ ...formState, code: e.target.value.toUpperCase() })
                    }
                    disabled={Boolean(editingCoupon)}
                    required
                  />
                  {editingCoupon && (
                    <span className="admin-form-hint">
                      Coupon code cannot be modified after creation.
                    </span>
                  )}
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="coupon-desc-input">
                    Description
                  </label>
                  <input
                    id="coupon-desc-input"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Summer festive discount"
                    value={formState.description}
                    onChange={(e) =>
                      setFormState({ ...formState, description: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Row 2: Discount Type & Discount Value */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="coupon-type-input">
                    Discount Type *
                  </label>
                  <select
                    id="coupon-type-input"
                    className="admin-form-input"
                    value={formState.discountType}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        discountType: e.target.value as AdminDiscountType,
                      })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="coupon-val-input">
                    Discount Value * (
                    {formState.discountType === 'percentage' ? '%' : '₹'})
                  </label>
                  <input
                    id="coupon-val-input"
                    type="number"
                    className="admin-form-input"
                    min="1"
                    max={formState.discountType === 'percentage' ? '100' : undefined}
                    value={formState.discountValue}
                    onChange={(e) =>
                      setFormState({ ...formState, discountValue: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Row 3: Minimum Order Value & Maximum Discount */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="coupon-min-order">
                    Minimum Order Value (₹)
                  </label>
                  <input
                    id="coupon-min-order"
                    type="number"
                    className="admin-form-input"
                    min="0"
                    placeholder="0"
                    value={formState.minimumOrderValue}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        minimumOrderValue: e.target.value,
                      })
                    }
                  />
                  <span className="admin-form-hint">
                    Minimum cart total required to use this coupon.
                  </span>
                </div>

                {formState.discountType === 'percentage' ? (
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="coupon-max-discount">
                      Maximum Discount (₹)
                    </label>
                    <input
                      id="coupon-max-discount"
                      type="number"
                      className="admin-form-input"
                      min="0"
                      placeholder="e.g. 500 (optional cap)"
                      value={formState.maximumDiscount}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          maximumDiscount: e.target.value,
                        })
                      }
                    />
                    <span className="admin-form-hint">
                      Maximum deduction cap for percentage discounts.
                    </span>
                  </div>
                ) : (
                  <div className="admin-form-group">
                    <label className="admin-form-label text-muted">
                      Maximum Discount (₹)
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value="N/A for Fixed Amount"
                      disabled
                    />
                  </div>
                )}
              </div>

              {/* Row 4: Start Date & Expiry Date */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="coupon-start-date">
                    Start Date *
                  </label>
                  <input
                    id="coupon-start-date"
                    type="date"
                    className="admin-form-input"
                    value={formState.startDate}
                    onChange={(e) =>
                      setFormState({ ...formState, startDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="coupon-expiry-date">
                    Expiry Date *
                  </label>
                  <input
                    id="coupon-expiry-date"
                    type="date"
                    className="admin-form-input"
                    value={formState.expiryDate}
                    onChange={(e) =>
                      setFormState({ ...formState, expiryDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Row 5: Usage Limit & Per-Customer Limit */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="coupon-usage-limit">
                    Total Usage Limit
                  </label>
                  <input
                    id="coupon-usage-limit"
                    type="number"
                    className="admin-form-input"
                    min="1"
                    placeholder="Unlimited if left empty"
                    value={formState.usageLimit}
                    onChange={(e) =>
                      setFormState({ ...formState, usageLimit: e.target.value })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="coupon-per-customer">
                    Limit Per Customer
                  </label>
                  <input
                    id="coupon-per-customer"
                    type="number"
                    className="admin-form-input"
                    min="1"
                    placeholder="Unlimited if left empty"
                    value={formState.perCustomerLimit}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        perCustomerLimit: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="admin-form-checkbox-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formState.active}
                    onChange={(e) =>
                      setFormState({ ...formState, active: e.target.checked })
                    }
                  />
                  <span>Coupon is Active</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSubmitting}
                  id="btn-save-coupon"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingCoupon
                    ? 'Update Coupon'
                    : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. DELETE CONFIRMATION DIALOG */}
      {deletingCoupon && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card admin-modal-card-sm">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Confirm Deletion</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setDeletingCoupon(null)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            <div className="admin-modal-body">
              <p>
                Are you sure you want to permanently delete coupon{' '}
                <strong className="text-white font-mono">
                  {deletingCoupon.code}
                </strong>
                ?
              </p>
              {deletingCoupon.usageCount > 0 ? (
                <div className="admin-callout admin-callout-warning">
                  <span className="text-bold">Warning:</span> This coupon has been
                  redeemed {deletingCoupon.usageCount} time(s). Used coupons cannot be
                  deleted for historical order audit reasons.
                </div>
              ) : (
                <span className="admin-modal-sub">
                  This coupon has zero redemptions and will be permanently removed.
                </span>
              )}

              {deleteError && (
                <div className="admin-modal-error" role="alert" style={{ marginTop: '1rem' }}>
                  {deleteError}
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setDeletingCoupon(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                id="btn-confirm-delete-coupon"
              >
                {isDeleting ? 'Deleting...' : 'Delete Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCoupons
