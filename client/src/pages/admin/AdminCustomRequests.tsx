import React, { useState, useEffect, useCallback } from 'react'
import {
  fetchAdminCustomRequests,
  updateAdminCustomRequestStatus,
  type AdminCustomRequest,
  type CustomRequestStatus,
} from '../../services/adminApi'
import '../../styles/Admin.css'

const CUSTOM_STATUSES: CustomRequestStatus[] = [
  'pending',
  'contacted',
  'quoted',
  'approved',
  'completed',
  'cancelled',
]

export const AdminCustomRequests: React.FC = () => {
  const [requests, setRequests] = useState<AdminCustomRequest[]>([])
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(15)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Selected item modal for viewing details and status updates
  const [activeItem, setActiveItem] = useState<AdminCustomRequest | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<CustomRequestStatus>('pending')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const loadRequests = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await fetchAdminCustomRequests({
        page,
        limit,
        status: statusFilter,
        search: searchTerm,
      })
      setRequests(data.requests)
      setTotalPages(data.pagination.pages)
      setTotalCount(data.pagination.total)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load custom requests.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, statusFilter, searchTerm])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadRequests()
  }

  const handleOpenDetail = (req: AdminCustomRequest) => {
    setActiveItem(req)
    setSelectedStatus(req.status)
    setModalFeedback(null)
  }

  const handleCloseDetail = () => {
    setActiveItem(null)
    setModalFeedback(null)
  }

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeItem) return
    setIsUpdatingStatus(true)
    setModalFeedback(null)

    try {
      const result = await updateAdminCustomRequestStatus(activeItem.requestId, selectedStatus)
      setActiveItem(result.request)
      setRequests((prev) =>
        prev.map((r) => (r.requestId === result.request.requestId ? result.request : r))
      )
      setModalFeedback({ type: 'success', message: 'Status updated successfully.' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update request status.'
      setModalFeedback({ type: 'error', message: msg })
    } finally {
      setIsUpdatingStatus(false)
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

  const getStatusBadgeClass = (status: CustomRequestStatus) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'status-badge status-success'
      case 'contacted':
      case 'quoted':
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
          <h1 className="admin-page-title">Custom Apparel Inquiries</h1>
          <p className="admin-page-subtitle">
            Manage bespoke design submissions, quote workflows, and production approvals.
          </p>
        </div>
      </header>

      {/* Control Bar: Search, Status Filter, Refresh */}
      <div className="admin-controls-card">
        <form onSubmit={handleSearchSubmit} className="admin-search-form">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by Request ID, name, email, or apparel type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="admin-btn admin-btn-secondary">
            Search
          </button>
        </form>

        <div className="admin-filter-group">
          <label htmlFor="custom-status-filter" className="admin-filter-label">
            Filter Status:
          </label>
          <select
            id="custom-status-filter"
            className="admin-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">All Statuses</option>
            {CUSTOM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={loadRequests}
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="admin-state-container" role="status">
          <div className="admin-spinner" />
          <p>Loading custom apparel requests...</p>
        </div>
      ) : errorMessage ? (
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage}</p>
          <button type="button" className="admin-btn admin-btn-primary" onClick={loadRequests}>
            Try Again
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="admin-state-container admin-state-empty">
          <p className="admin-empty-title">No custom requests found</p>
          <p className="admin-empty-desc">
            {searchTerm || statusFilter !== 'all'
              ? 'Try modifying your search query or filter criteria.'
              : 'There are currently no custom apparel requests in the database.'}
          </p>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Customer</th>
                  <th>Apparel Type</th>
                  <th>Quantity</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.requestId}>
                    <td className="font-mono font-bold text-white">{req.requestId}</td>
                    <td>
                      <div className="admin-customer-cell">
                        <span className="customer-name font-medium">{req.name}</span>
                        <span className="customer-sub">{req.email}</span>
                      </div>
                    </td>
                    <td className="font-medium text-white">{req.apparelType}</td>
                    <td>{req.quantity} pcs</td>
                    <td className="text-muted">{formatDate(req.createdAt)}</td>
                    <td>
                      <span className={getStatusBadgeClass(req.status)}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="admin-btn-action"
                        onClick={() => handleOpenDetail(req)}
                        aria-label={`View custom request ${req.requestId}`}
                      >
                        Review / Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="admin-pagination-bar">
            <span className="admin-pagination-info">
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total inquiries)
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

      {/* Detail & Status Modal Drawer */}
      {activeItem && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">Custom Request {activeItem.requestId}</h2>
                <span className="text-muted">Submitted on {formatDate(activeItem.createdAt)}</span>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={handleCloseDetail}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {modalFeedback && (
                <div
                  className={`admin-feedback-alert ${
                    modalFeedback.type === 'success' ? 'feedback-success' : 'feedback-error'
                  }`}
                  role="alert"
                >
                  {modalFeedback.message}
                </div>
              )}

              {/* Status Update Form */}
              <form onSubmit={handleStatusSubmit} className="admin-modal-status-box">
                <label htmlFor="modal-status-select" className="admin-form-label">
                  Inquiry Lifecycle Status:
                </label>
                <div className="admin-status-update-row">
                  <select
                    id="modal-status-select"
                    className="admin-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as CustomRequestStatus)}
                    disabled={isUpdatingStatus}
                  >
                    {CUSTOM_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={isUpdatingStatus || selectedStatus === activeItem.status}
                  >
                    {isUpdatingStatus ? 'Saving...' : 'Update Status'}
                  </button>
                </div>
              </form>

              {/* Details Key-Value List */}
              <div className="admin-detail-specs">
                <div className="spec-group">
                  <span className="spec-label">Contact Name</span>
                  <span className="spec-value text-white font-medium">{activeItem.name}</span>
                </div>
                <div className="spec-group">
                  <span className="spec-label">Email</span>
                  <span className="spec-value font-mono">{activeItem.email}</span>
                </div>
                <div className="spec-group">
                  <span className="spec-label">Phone</span>
                  <span className="spec-value font-mono">{activeItem.phone}</span>
                </div>
                <div className="spec-group">
                  <span className="spec-label">Apparel Type</span>
                  <span className="spec-value text-white">{activeItem.apparelType}</span>
                </div>
                <div className="spec-group">
                  <span className="spec-label">Quantity</span>
                  <span className="spec-value text-white">{activeItem.quantity} units</span>
                </div>
                <div className="spec-group">
                  <span className="spec-label">Size Range</span>
                  <span className="spec-value text-white">{activeItem.sizeRange}</span>
                </div>
                <div className="spec-group">
                  <span className="spec-label">Printing Method</span>
                  <span className="spec-value text-white">{activeItem.printingType}</span>
                </div>
                {activeItem.fileName && (
                  <div className="spec-group">
                    <span className="spec-label">Attached Artwork File</span>
                    <span className="spec-value font-mono text-muted">{activeItem.fileName}</span>
                  </div>
                )}
              </div>

              {/* Description Block */}
              <div className="admin-text-section">
                <span className="spec-label">Design Description & Requirements</span>
                <p className="admin-text-box">{activeItem.description}</p>
              </div>

              {activeItem.additionalRequirements && (
                <div className="admin-text-section">
                  <span className="spec-label">Additional Instructions</span>
                  <p className="admin-text-box">{activeItem.additionalRequirements}</p>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleCloseDetail}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCustomRequests
