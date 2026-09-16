import { getAuthToken } from './authApi'
import { getAdminAuthToken, clearAdminAuthToken, clearStoredAdminUser } from './adminApi'

const API_BASE_URL = 'http://localhost:5000/api'

export interface Review {
  _id: string
  productId: string
  rating: number
  review: string
  customerName: string
  createdAt: string
  updatedAt: string
}

export interface RatingDistribution {
  '1': number
  '2': number
  '3': number
  '4': number
  '5': number
  [key: string]: number
}

export interface RatingSummary {
  averageRating: number
  totalReviews: number
  distribution: RatingDistribution
}

export interface ProductReviewsResponse {
  success: boolean
  productId: string
  summary: RatingSummary
  page: number
  totalPages: number
  reviews: Review[]
}

export interface MyReview {
  _id: string
  productId: string
  productName: string
  productImage: string
  rating: number
  review: string
  status: 'pending' | 'approved' | 'hidden'
  customerName: string
  createdAt: string
  updatedAt: string
}

export interface MyReviewsResponse {
  success: boolean
  count: number
  reviews: MyReview[]
}

export interface ReviewActionResponse {
  success: boolean
  message: string
  review?: Review | MyReview
}

export interface AdminReview {
  _id: string
  productId: string
  productName: string
  productImage: string
  userId?: string
  customerName: string
  rating: number
  review: string
  status: 'pending' | 'approved' | 'hidden'
  createdAt: string
  updatedAt: string
}

export interface AdminReviewsFilterParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  rating?: number
  productId?: string
}

export interface AdminReviewsResponse {
  success: boolean
  total: number
  page: number
  limit: number
  totalPages: number
  reviews: AdminReview[]
}

export interface AdminReviewDetailResponse {
  success: boolean
  review: AdminReview
}

/**
 * Public endpoint: Fetches approved reviews and dynamic rating summary for a product.
 */
export async function getProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<ProductReviewsResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${API_BASE_URL}/reviews/product/${encodeURIComponent(productId)}?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await res.json().catch(() => null)

    if (!res.ok || !data?.success) {
      if (res.status === 404) {
        throw new Error('Product not found.')
      }
      throw new Error(data?.message || 'Failed to load reviews for this product.')
    }

    return data as ProductReviewsResponse
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out while loading reviews.')
      }
      throw err
    }
    throw new Error('Unable to load reviews. Please check your network.')
  }
}

/**
 * Customer endpoint: Creates a new review for a product.
 * Requires customer JWT token.
 */
export async function createReview(
  productId: string,
  rating: number,
  review: string
): Promise<ReviewActionResponse> {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Please log in to submit a review.')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId,
        rating,
        review,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await res.json().catch(() => null)

    if (!res.ok || !data?.success) {
      if (res.status === 401) {
        throw new Error('Session expired. Please log in again.')
      }
      if (res.status === 409) {
        throw new Error('You have already reviewed this product. You can update your existing review instead.')
      }
      if (res.status === 400) {
        throw new Error(data?.message || 'Invalid review data. Please check your rating and review text.')
      }
      throw new Error(data?.message || 'Failed to submit review.')
    }

    return data as ReviewActionResponse
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Submission timed out. Please try again.')
      }
      throw err
    }
    throw new Error('Unable to submit review. Please try again.')
  }
}

/**
 * Customer endpoint: Fetches reviews written by the currently logged-in customer.
 */
export async function getMyReviews(): Promise<MyReviewsResponse> {
  const token = getAuthToken()
  if (!token) {
    return { success: true, count: 0, reviews: [] }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await res.json().catch(() => null)

    if (!res.ok || !data?.success) {
      if (res.status === 401) {
        return { success: true, count: 0, reviews: [] }
      }
      throw new Error(data?.message || 'Failed to retrieve your reviews.')
    }

    return data as MyReviewsResponse
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out.')
      }
      throw err
    }
    throw new Error('Unable to retrieve your reviews.')
  }
}

/**
 * Customer endpoint: Updates an existing review written by the customer.
 * Editing automatically sets the review to 'pending' for moderation.
 */
export async function updateReview(
  reviewId: string,
  rating?: number,
  review?: string
): Promise<ReviewActionResponse> {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Please log in to update your review.')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const payload: { rating?: number; review?: string } = {}
    if (rating !== undefined) payload.rating = rating
    if (review !== undefined) payload.review = review

    const res = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await res.json().catch(() => null)

    if (!res.ok || !data?.success) {
      if (res.status === 401) {
        throw new Error('Session expired. Please log in again.')
      }
      if (res.status === 403) {
        throw new Error('You can only edit your own reviews.')
      }
      if (res.status === 404) {
        throw new Error('Review not found.')
      }
      throw new Error(data?.message || 'Failed to update review.')
    }

    return data as ReviewActionResponse
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.')
      }
      throw err
    }
    throw new Error('Unable to update review. Please try again.')
  }
}

/**
 * Customer endpoint: Deletes a review owned by the authenticated customer.
 */
export async function deleteReview(reviewId: string): Promise<ReviewActionResponse> {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Please log in to delete your review.')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await res.json().catch(() => null)

    if (!res.ok || !data?.success) {
      if (res.status === 401) {
        throw new Error('Session expired. Please log in again.')
      }
      if (res.status === 403) {
        throw new Error('You can only delete your own reviews.')
      }
      if (res.status === 404) {
        throw new Error('Review not found.')
      }
      throw new Error(data?.message || 'Failed to delete review.')
    }

    return data as ReviewActionResponse
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out.')
      }
      throw err
    }
    throw new Error('Unable to delete review. Please try again.')
  }
}

// =========================================================================
// ADMIN REVIEW MODERATION API METHODS
// =========================================================================

async function adminReviewFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminAuthToken()
  if (!token) {
    throw new Error('Admin authentication required. Please sign in.')
  }

  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await response.json().catch(() => null)

    if (!response.ok || !data?.success) {
      if (response.status === 401) {
        clearAdminAuthToken()
        clearStoredAdminUser()
        throw new Error(data?.message || 'Admin session expired. Please sign in again.')
      }
      if (response.status === 403) {
        throw new Error(data?.message || 'Access denied: Admin privileges required.')
      }
      if (response.status === 404) {
        throw new Error(data?.message || 'Review not found.')
      }
      throw new Error(data?.message || 'Admin operation failed.')
    }

    return data as unknown as T
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please check your network.')
      }
      throw err
    }
    throw new Error('Unable to connect to admin server. Please try again.')
  }
}

/**
 * Admin: Fetches paginated reviews with filters for status, rating, productId, and search.
 */
export async function fetchAdminReviews(
  params: AdminReviewsFilterParams = {}
): Promise<AdminReviewsResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search && params.search.trim()) query.set('search', params.search.trim())
  if (params.status && params.status !== 'all') query.set('status', params.status)
  if (params.rating && params.rating >= 1 && params.rating <= 5) query.set('rating', String(params.rating))
  if (params.productId && params.productId.trim()) query.set('productId', params.productId.trim())

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return adminReviewFetch<AdminReviewsResponse>(`/admin/reviews${queryString}`)
}

/**
 * Admin: Fetches details for a single review by ID.
 */
export async function fetchAdminReviewById(reviewId: string): Promise<AdminReviewDetailResponse> {
  return adminReviewFetch<AdminReviewDetailResponse>(`/admin/reviews/${encodeURIComponent(reviewId)}`)
}

/**
 * Admin: Updates review moderation status ('pending' | 'approved' | 'hidden').
 */
export async function updateAdminReviewStatus(
  reviewId: string,
  status: 'pending' | 'approved' | 'hidden'
): Promise<{ success: boolean; message: string; review: AdminReview }> {
  return adminReviewFetch<{ success: boolean; message: string; review: AdminReview }>(
    `/admin/reviews/${encodeURIComponent(reviewId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  )
}

/**
 * Admin: Permanently deletes a review.
 */
export async function deleteAdminReview(
  reviewId: string
): Promise<{ success: boolean; message: string }> {
  return adminReviewFetch<{ success: boolean; message: string }>(
    `/admin/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: 'DELETE',
    }
  )
}
