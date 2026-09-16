import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getProductReviews,
  createReview,
  getMyReviews,
  updateReview,
  deleteReview,
  type Review,
  type RatingSummary,
  type MyReview,
} from '../../services/reviewApi'
import '../../styles/ProductReviews.css'

interface ProductReviewsSectionProps {
  productId: string
}

const STAR_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ productId }) => {
  const { isAuthenticated } = useAuth()

  // Product reviews & summary state
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<RatingSummary>({
    averageRating: 0,
    totalReviews: 0,
    distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
  })
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Customer's own review for this product (if logged in)
  const [myReview, setMyReview] = useState<MyReview | null>(null)

  // Form states (Write / Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [formRating, setFormRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [formText, setFormText] = useState<string>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Delete modal/action state
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false)

  // 1. Fetch public reviews and summary
  const loadProductReviews = useCallback(async () => {
    if (!productId) return
    setIsLoading(true)
    setLoadError(null)

    try {
      const data = await getProductReviews(productId, page, 8)
      if (data && data.success) {
        setReviews(data.reviews || [])
        setSummary(data.summary || {
          averageRating: 0,
          totalReviews: 0,
          distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        })
        setTotalPages(data.totalPages || 1)
      } else {
        setLoadError('Unable to load reviews for this product.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load reviews.'
      setLoadError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [productId, page])

  // 2. Fetch logged-in customer's own review
  const loadCustomerReview = useCallback(async () => {
    if (!isAuthenticated || !productId) {
      setMyReview(null)
      return
    }

    try {
      const res = await getMyReviews()
      if (res && res.success && res.reviews) {
        const found = res.reviews.find((r) => r.productId === productId)
        setMyReview(found || null)
      }
    } catch {
      // Ignore background fetch error for customer review check
    }
  }, [isAuthenticated, productId])

  useEffect(() => {
    loadProductReviews()
  }, [loadProductReviews])

  useEffect(() => {
    loadCustomerReview()
  }, [loadCustomerReview])

  // Open Create Review form
  const handleOpenCreateForm = () => {
    setIsEditMode(false)
    setFormRating(5)
    setFormText('')
    setFormError(null)
    setFormSuccess(null)
    setIsFormOpen(true)
  }

  // Open Edit Review form
  const handleOpenEditForm = () => {
    if (!myReview) return
    setIsEditMode(true)
    setFormRating(myReview.rating)
    setFormText(myReview.review)
    setFormError(null)
    setFormSuccess(null)
    setIsFormOpen(true)
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setIsEditMode(false)
    setFormError(null)
  }

  // Submit Review (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    const trimmed = formText.trim()
    if (!trimmed) {
      setFormError('Please enter your review comments.')
      return
    }
    if (trimmed.length < 3) {
      setFormError('Review must be at least 3 characters long.')
      return
    }
    if (trimmed.length > 1000) {
      setFormError('Review cannot exceed 1000 characters.')
      return
    }
    if (formRating < 1 || formRating > 5) {
      setFormError('Please select a star rating between 1 and 5.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode && myReview) {
        // PATCH /api/reviews/:reviewId
        await updateReview(myReview._id, formRating, trimmed)
        setFormSuccess('Your updated review is awaiting moderation.')
        setIsFormOpen(false)
        await loadCustomerReview()
        await loadProductReviews()
      } else {
        // POST /api/reviews
        const res = await createReview(productId, formRating, trimmed)
        setFormSuccess(res.message || 'Thank you! Your review has been submitted.')
        setIsFormOpen(false)
        setFormText('')
        await loadCustomerReview()
        await loadProductReviews()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review. Please try again.'
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Customer Review
  const handleDeleteReview = async () => {
    if (!myReview) return
    setIsDeleting(true)
    setFormError(null)

    try {
      await deleteReview(myReview._id)
      setDeleteConfirmOpen(false)
      setMyReview(null)
      setFormSuccess('Your review was successfully removed.')
      await loadProductReviews()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete review.'
      setFormError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  // Render Stars Helper
  const renderStars = (rating: number, max = 5) => {
    return Array.from({ length: max }, (_, index) => {
      const isFilled = index + 1 <= Math.round(rating)
      return (
        <span key={index} aria-hidden="true">
          {isFilled ? '★' : '☆'}
        </span>
      )
    })
  }

  const formatDate = (dateStr: string) => {
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
  }

  return (
    <section className="kala-reviews-section" aria-label="Customer Reviews and Ratings">
      <div className="kala-reviews-header-wrap">
        <span className="kala-reviews-badge">VOICE OF KALA</span>
        <h2 className="kala-reviews-heading">REVIEWS & RATINGS</h2>
      </div>

      {/* Global Success / Alert Banner */}
      {formSuccess && (
        <div className="kala-form-feedback success" role="status">
          ✓ {formSuccess}
        </div>
      )}

      {/* 1. RATING SUMMARY BOX */}
      <div className="kala-reviews-summary-card">
        {/* Left: Big Score & Average Stars */}
        <div className="kala-summary-score-box">
          <div className="kala-summary-average">
            {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : '0.0'}
          </div>
          <div className="kala-summary-stars" aria-label={`Average rating ${summary.averageRating} out of 5 stars`}>
            {renderStars(summary.averageRating)}
          </div>
          <div className="kala-summary-count">
            {summary.totalReviews === 0
              ? 'No ratings yet'
              : `${summary.totalReviews} ${summary.totalReviews === 1 ? 'verified review' : 'verified reviews'}`}
          </div>
        </div>

        {/* Right: Rating Distribution Bars (5 to 1) */}
        <div className="kala-distribution-list" aria-label="Rating distribution">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.distribution?.[String(stars)] || 0
            const percentage = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0
            return (
              <div key={stars} className="kala-distribution-row">
                <div className="kala-distribution-label">
                  {stars} <span>★</span>
                </div>
                <div className="kala-distribution-bar-bg">
                  <div
                    className="kala-distribution-bar-fill"
                    style={{ width: `${percentage}%` }}
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="kala-distribution-val">{count}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. CUSTOMER INTERACTION / WRITE A REVIEW BAR */}
      <div className="kala-review-cta-box">
        {!isAuthenticated ? (
          <div className="kala-review-guest-prompt">
            <div className="kala-review-guest-text">
              Have you experienced this piece? Sign in with your KALA account to write a verified review.
            </div>
            <Link to="/account" className="kala-review-login-btn">
              LOG IN TO WRITE A REVIEW
            </Link>
          </div>
        ) : myReview ? (
          <div className="kala-my-review-banner">
            <div className="kala-my-review-top">
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--kala-black)' }}>Your Review</strong>
                <span style={{ marginLeft: '0.75rem' }} className={`kala-my-review-badge ${myReview.status}`}>
                  {myReview.status === 'approved'
                    ? 'Approved'
                    : myReview.status === 'pending'
                    ? 'Pending Moderation'
                    : 'Hidden'}
                </span>
              </div>
              <div className="kala-my-review-actions">
                <button
                  type="button"
                  className="kala-btn-pill"
                  onClick={handleOpenEditForm}
                  disabled={isFormOpen || isDeleting}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="kala-btn-pill danger"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={isFormOpen || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', marginBottom: '0.4rem' }}>
              {renderStars(myReview.rating)}
              <span style={{ fontSize: '0.8rem', color: 'var(--kala-text-secondary)', marginLeft: '0.25rem' }}>
                ({STAR_LABELS[myReview.rating]})
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#374151', margin: 0, whiteSpace: 'pre-line' }}>
              {myReview.review}
            </p>
          </div>
        ) : !isFormOpen ? (
          <div className="kala-review-guest-prompt">
            <div className="kala-review-guest-text">
              Share your thoughts about fit, craftsmanship, and styling to help the KALA community.
            </div>
            <button
              type="button"
              className="kala-review-login-btn"
              onClick={handleOpenCreateForm}
            >
              WRITE A REVIEW
            </button>
          </div>
        ) : null}

        {/* Delete Confirmation Modal / Prompt */}
        {deleteConfirmOpen && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              marginTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
            role="alertdialog"
            aria-labelledby="delete-review-title"
          >
            <div id="delete-review-title" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#991b1b' }}>
              Are you sure you want to delete your review? This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="kala-btn-pill danger"
                onClick={handleDeleteReview}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                type="button"
                className="kala-btn-pill"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 3. REVIEW FORM (CREATE OR EDIT) */}
        {isFormOpen && (
          <form className="kala-review-form-card" onSubmit={handleFormSubmit}>
            <h3 className="kala-form-title">
              {isEditMode ? 'EDIT YOUR REVIEW' : 'WRITE A PRODUCT REVIEW'}
            </h3>

            {formError && (
              <div className="kala-form-feedback error" role="alert">
                {formError}
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="kala-star-picker-wrap">
              <label className="kala-star-picker-label">Rating (1 to 5 Stars)</label>
              <div
                className="kala-star-picker-buttons"
                role="radiogroup"
                aria-label="Select star rating"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeStar = hoverRating > 0 ? star <= hoverRating : star <= formRating
                  return (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={formRating === star}
                      aria-label={`${star} star${star > 1 ? 's' : ''} - ${STAR_LABELS[star]}`}
                      className={`kala-star-btn ${activeStar ? 'active' : ''}`}
                      onClick={() => setFormRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                    >
                      ★
                    </button>
                  )
                })}
                <span className="kala-star-helper-text">
                  {STAR_LABELS[hoverRating || formRating]}
                </span>
              </div>
            </div>

            {/* Review Textarea */}
            <div>
              <label htmlFor="kala-review-input" className="kala-star-picker-label">
                Your Review
              </label>
              <textarea
                id="kala-review-input"
                className="kala-review-textarea"
                rows={4}
                maxLength={1000}
                placeholder="Share your thoughts regarding the silhouette, textile quality, comfort, and drape..."
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                required
              />
              <div className="kala-textarea-meta">
                <span>Minimum 3 characters</span>
                <span>{formText.trim().length} / 1000</span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="kala-review-form-actions">
              <button
                type="submit"
                className="kala-review-login-btn"
                disabled={isSubmitting || formText.trim().length < 3}
              >
                {isSubmitting
                  ? isEditMode
                    ? 'UPDATING...'
                    : 'SUBMITTING...'
                  : isEditMode
                  ? 'UPDATE REVIEW'
                  : 'SUBMIT REVIEW'}
              </button>
              <button
                type="button"
                className="kala-btn-pill"
                onClick={handleCancelForm}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4. PUBLIC REVIEWS LIST */}
      {isLoading ? (
        <div className="kala-reviews-loading" role="status">
          <div className="kala-reviews-spinner" />
          <span>Loading reviews...</span>
        </div>
      ) : loadError ? (
        <div className="kala-reviews-error" role="alert">
          <p>{loadError}</p>
          <button
            type="button"
            className="kala-reviews-error-btn"
            onClick={loadProductReviews}
          >
            Retry
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="kala-reviews-empty">
          <div className="kala-reviews-empty-title">No reviews yet</div>
          <div className="kala-reviews-empty-text">
            Be the first to review this product and share your experience with the KALA collective.
          </div>
        </div>
      ) : (
        <>
          <div className="kala-reviews-list">
            {reviews.map((rev) => (
              <article key={rev._id} className="kala-review-card">
                <div className="kala-review-card-top">
                  <div className="kala-review-author-info">
                    <div className="kala-review-author-avatar" aria-hidden="true">
                      {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div className="kala-review-author-name">{rev.customerName}</div>
                      <div className="kala-review-badge-verified">
                        <span>✓</span> Verified Buyer
                      </div>
                    </div>
                  </div>
                  <time className="kala-review-date" dateTime={rev.createdAt}>
                    {formatDate(rev.createdAt)}
                  </time>
                </div>

                <div className="kala-review-card-rating" aria-label={`Rated ${rev.rating} out of 5 stars`}>
                  {renderStars(rev.rating)}
                </div>

                <p className="kala-review-card-text">{rev.review}</p>
              </article>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="kala-reviews-pagination" aria-label="Review page navigation">
              <button
                type="button"
                className="kala-reviews-page-btn"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
              >
                ← Previous
              </button>
              <span className="kala-reviews-page-info">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="kala-reviews-page-btn"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default ProductReviewsSection
