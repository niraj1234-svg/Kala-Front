import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminReviews,
  updateAdminReviewStatus,
  deleteAdminReview,
  type AdminReview,
} from '../../services/adminApi'
import '../../styles/Admin.css'

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(20)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalReviews, setTotalReviews] = useState<number>(0)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null)

  // Action states
  const [updatingReviewId, setUpdatingReviewId] = useState<string | null>(null)
  const [deletingReview, setDeletingReview] = useState<AdminReview | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 350)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Fetch reviews from admin API
  const loadReviews = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetchAdminReviews({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        rating: ratingFilter !== 'all' ? parseInt(ratingFilter, 10) : undefined,
      })

      if (res && res.success) {
        setReviews(res.reviews || [])
        setTotalReviews(res.total)
        setTotalPages(res.totalPages || 1)
      } else {
        setErrorMessage('Failed to load reviews.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to administrative reviews service.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, debouncedSearch, statusFilter, ratingFilter])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  // Quick Status Update
  const handleQuickStatusChange = async (reviewId: string, newStatus: 'approved' | 'hidden' | 'pending') => {
    setUpdatingReviewId(reviewId)
    setActionSuccessMessage(null)
    setErrorMessage(null)

    try {
      await updateAdminReviewStatus(reviewId, newStatus)
      setActionSuccessMessage(`Review status updated to '${newStatus}'.`)
      // Optimistically update local review list
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update review status.'
      setErrorMessage(msg)
    } finally {
      setUpdatingReviewId(null)
    }
  }

  // Delete Review
  const handleConfirmDelete = async () => {
    if (!deletingReview) return
    setIsDeleting(true)
    setErrorMessage(null)

    try {
      await deleteAdminReview(deletingReview._id)
      setActionSuccessMessage('Review permanently deleted.')
      setDeletingReview(null)
      await loadReviews()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete review.'
      setErrorMessage(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  // Format Date
  const formatDate = (dateStr: string) => {
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
  }

  // Status Badge Class Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge status-success">APPROVED</span>
      case 'pending':
        return <span className="status-badge status-warning">PENDING</span>
      case 'hidden':
        return <span className="status-badge status-danger">HIDDEN</span>
      default:
        return <span className="status-badge">{status.toUpperCase()}</span>
    }
  }

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reviews & Ratings Moderation</h1>
          <p className="admin-page-subtitle">
            Manage customer feedback, moderate ratings, and maintain catalog review integrity.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
            Total Reviews: <strong style={{ color: '#ffffff' }}>{totalReviews}</strong>
          </span>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={loadReviews}
            disabled={isLoading}
            title="Refresh review records"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Success / Feedback Banners */}
      {actionSuccessMessage && (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ade80',
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
          role="status"
        >
          ✓ {actionSuccessMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
          role="alert"
        >
          ✕ {errorMessage}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="admin-controls-card">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); loadReviews(); }} className="admin-search-form">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by product, customer, or review text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="admin-filters-group">
          {/* Status Filter */}
          <label htmlFor="status-filter" className="admin-filter-label">
            Status:
          </label>
          <select
            id="status-filter"
            className="admin-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="hidden">Hidden</option>
          </select>

          {/* Rating Filter */}
          <label htmlFor="rating-filter" className="admin-filter-label">
            Rating:
          </label>
          <select
            id="rating-filter"
            className="admin-select"
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Main Review Table / States */}
      {isLoading ? (
        <div className="admin-state-container" role="status">
          <div className="admin-spinner" />
          <p>Loading customer reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="admin-state-container admin-state-empty">
          <p className="admin-empty-title">No reviews found</p>
          <p className="admin-empty-desc">
            {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all'
              ? 'Try modifying your search query or filter criteria.'
              : 'There are currently no customer reviews in the database.'}
          </p>
          {(searchTerm || statusFilter !== 'all' || ratingFilter !== 'all') && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setRatingFilter('all')
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
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review Preview</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => (
                  <tr key={rev._id}>
                    {/* Product Cell */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {rev.productImage && (
                          <img
                            src={rev.productImage}
                            alt={rev.productName}
                            style={{
                              width: '36px',
                              height: '44px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              backgroundColor: '#1f1f23',
                            }}
                          />
                        )}
                        <div>
                          <div className="font-medium text-white" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rev.productName || rev.productId}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {rev.productId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Customer Cell */}
                    <td>
                      <div className="font-medium text-white">{rev.customerName || 'Verified Customer'}</div>
                      {rev.userId && (
                        <div className="text-muted" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          ID: {rev.userId.slice(-6)}
                        </div>
                      )}
                    </td>

                    {/* Rating Stars Cell */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: 700 }}>
                        <span>★</span>
                        <span>{rev.rating}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 400 }}>/ 5</span>
                      </div>
                    </td>

                    {/* Review Snippet Cell */}
                    <td style={{ maxWidth: '280px' }}>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: '#d4d4d8',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4,
                        }}
                        title={rev.review}
                      >
                        {rev.review}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>{getStatusBadge(rev.status)}</td>

                    {/* Date */}
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {formatDate(rev.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Link
                          to={`/admin/reviews/${rev._id}`}
                          className="admin-btn-action"
                          title="View review detail & full text"
                        >
                          Details
                        </Link>

                        {rev.status !== 'approved' && (
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleQuickStatusChange(rev._id, 'approved')}
                            disabled={updatingReviewId === rev._id}
                            title="Approve review publicly"
                          >
                            Approve
                          </button>
                        )}

                        {rev.status !== 'hidden' && (
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleQuickStatusChange(rev._id, 'hidden')}
                            disabled={updatingReviewId === rev._id}
                            title="Hide review from public storefront"
                          >
                            Hide
                          </button>
                        )}

                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => setDeletingReview(rev)}
                          title="Permanently delete review"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="admin-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                Showing Page <strong style={{ color: '#ffffff' }}>{page}</strong> of <strong style={{ color: '#ffffff' }}>{totalPages}</strong> ({totalReviews} total reviews)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
        >
          <div
            style={{
              background: '#18181b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 id="modal-delete-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
              Delete Review Permanently?
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to delete this review by{' '}
              <strong style={{ color: '#ffffff' }}>{deletingReview.customerName}</strong> for product{' '}
              <strong style={{ color: '#ffffff' }}>{deletingReview.productName || deletingReview.productId}</strong>?
              This action is permanent and cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setDeletingReview(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReviews
