import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  fetchAdminReviewById,
  updateAdminReviewStatus,
  deleteAdminReview,
  type AdminReview,
} from '../../services/adminApi'
import '../../styles/Admin.css'

export const AdminReviewDetail: React.FC = () => {
  const { reviewId } = useParams<{ reviewId: string }>()
  const navigate = useNavigate()

  const [review, setReview] = useState<AdminReview | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Status update state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)

  // Delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const loadReview = useCallback(async () => {
    if (!reviewId) return
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = await fetchAdminReviewById(reviewId)
      if (data && data.success && data.review) {
        setReview(data.review)
      } else {
        setErrorMessage('Review record not found.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve review details.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }, [reviewId])

  useEffect(() => {
    loadReview()
  }, [loadReview])

  // Handle status update
  const handleStatusChange = async (newStatus: 'pending' | 'approved' | 'hidden') => {
    if (!reviewId) return
    setIsUpdatingStatus(true)
    setFeedbackMessage(null)

    try {
      const res = await updateAdminReviewStatus(reviewId, newStatus)
      if (res && res.success) {
        setReview(res.review)
        setFeedbackMessage({
          type: 'success',
          text: `Review status successfully changed to '${newStatus}'.`,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update review status.'
      setFeedbackMessage({ type: 'error', text: msg })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Handle permanent deletion
  const handleDelete = async () => {
    if (!reviewId) return
    setIsDeleting(true)
    setFeedbackMessage(null)

    try {
      await deleteAdminReview(reviewId)
      navigate('/admin/reviews', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete review.'
      setFeedbackMessage({ type: 'error', text: msg })
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#f59e0b' : '#4b5563', fontSize: '1.25rem' }}>
        ★
      </span>
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge status-success">APPROVED</span>
      case 'pending':
        return <span className="status-badge status-warning">PENDING MODERATION</span>
      case 'hidden':
        return <span className="status-badge status-danger">HIDDEN</span>
      default:
        return <span className="status-badge">{status.toUpperCase()}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="admin-page-container">
        <div className="admin-state-container" role="status">
          <div className="admin-spinner" />
          <p>Loading review details...</p>
        </div>
      </div>
    )
  }

  if (errorMessage || !review) {
    return (
      <div className="admin-page-container">
        <div className="admin-state-container admin-state-error">
          <p className="admin-error-text">{errorMessage || 'Review not found.'}</p>
          <Link to="/admin/reviews" className="admin-btn admin-btn-secondary" style={{ marginTop: '1rem' }}>
            ← Back to Reviews
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page-container">
      {/* Top Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/admin/reviews"
          style={{
            color: '#a1a1aa',
            textDecoration: 'none',
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          ← Back to Reviews
        </Link>
      </div>

      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Review Moderation</h1>
          <p className="admin-page-subtitle">
            Review ID: <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>{review._id}</span>
          </p>
        </div>
        <div>{getStatusBadge(review.status)}</div>
      </header>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          style={{
            background: feedbackMessage.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${feedbackMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: feedbackMessage.type === 'success' ? '#4ade80' : '#f87171',
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
          role="status"
        >
          {feedbackMessage.type === 'success' ? '✓' : '✕'} {feedbackMessage.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Product Details Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">PRODUCT</span>
            <Link
              to={`/product/${review.productId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.75rem', color: 'var(--kala-orange)', textDecoration: 'underline' }}
            >
              View in Store ↗
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {review.productImage && (
              <img
                src={review.productImage}
                alt={review.productName}
                style={{
                  width: '64px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  backgroundColor: '#18181b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            )}
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                {review.productName || review.productId}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
                ID: <code style={{ color: '#d4d4d8' }}>{review.productId}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">CUSTOMER</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Display Name: </span>
              <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{review.customerName}</strong>
            </div>
            {review.userId && (
              <div>
                <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Customer ID: </span>
                <code style={{ fontSize: '0.85rem', color: '#d4d4d8' }}>{review.userId}</code>
              </div>
            )}
            <div>
              <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Submitted Date: </span>
              <span style={{ fontSize: '0.85rem', color: '#d4d4d8' }}>{formatDate(review.createdAt)}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Last Updated: </span>
              <span style={{ fontSize: '0.85rem', color: '#d4d4d8' }}>{formatDate(review.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Content Card */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <span className="admin-card-title">REVIEW CONTENT</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex' }}>{renderStars(review.rating)}</div>
            <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{review.rating} / 5</strong>
          </div>
        </div>
        <div
          style={{
            background: '#09090b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            padding: '1.25rem',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: '#e4e4e7',
            whiteSpace: 'pre-line',
          }}
        >
          {review.review}
        </div>
      </div>

      {/* Moderation Actions Card */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <span className="admin-card-title">MODERATION ACTIONS</span>
        </div>
        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Changing moderation status immediately impacts visibility on the customer-facing storefront. Approved reviews appear publicly with aggregated star ratings.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            style={{ backgroundColor: '#15803d', borderColor: '#16a34a' }}
            onClick={() => handleStatusChange('approved')}
            disabled={isUpdatingStatus || review.status === 'approved'}
          >
            {review.status === 'approved' ? '✓ Currently Approved' : 'Approve Review'}
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            style={{ backgroundColor: '#78350f', borderColor: '#b45309', color: '#fef3c7' }}
            onClick={() => handleStatusChange('pending')}
            disabled={isUpdatingStatus || review.status === 'pending'}
          >
            {review.status === 'pending' ? '● Currently Pending' : 'Mark as Pending'}
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }}
            onClick={() => handleStatusChange('hidden')}
            disabled={isUpdatingStatus || review.status === 'hidden'}
          >
            {review.status === 'hidden' ? '✕ Currently Hidden' : 'Hide from Public Store'}
          </button>
        </div>
      </div>

      {/* Danger Zone: Delete Permanently */}
      <div
        style={{
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '8px',
          padding: '1.5rem',
          background: 'rgba(239, 68, 68, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h4 style={{ color: '#f87171', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
            Permanent Deletion
          </h4>
          <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: 0 }}>
            Permanently remove this review from the database. This action is irreversible.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-danger"
          onClick={() => setDeleteConfirmOpen(true)}
        >
          Delete Review Permanently
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
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
          aria-labelledby="modal-delete-detail-title"
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
            <h3 id="modal-delete-detail-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
              Confirm Permanent Deletion
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to permanently delete this review for{' '}
              <strong style={{ color: '#ffffff' }}>{review.productName || review.productId}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleDelete}
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

export default AdminReviewDetail
