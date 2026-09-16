const API_BASE_URL = 'http://localhost:5000/api'
const ADMIN_AUTH_TOKEN_KEY = 'kala_admin_auth_token'
const ADMIN_USER_KEY = 'kala_admin_user'

export interface AdminUser {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'admin'
}

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminLoginResponse {
  success: boolean
  message: string
  token: string
  user: AdminUser
}

export interface AdminOrderItem {
  productId: string
  name: string
  image: string
  size: string
  quantity: number
  price: number
}

export interface AdminCustomer {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface AdminShippingAddress {
  address: string
  city: string
  state: string
  pincode: string
}

export interface AdminPricing {
  subtotal: number
  shipping: number
  total: number
}

export interface AdminOrderTracking {
  trackingNumber?: string
  carrier?: string
  updatedAt?: string
}

export type AdminOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface AdminOrder {
  orderId: string
  userId?: string
  customer: AdminCustomer
  shippingAddress: AdminShippingAddress
  items: AdminOrderItem[]
  pricing: AdminPricing
  status: AdminOrderStatus
  tracking?: AdminOrderTracking
  createdAt: string
  updatedAt: string
}

export interface AdminPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface AdminOrdersResponse {
  success: boolean
  orders: AdminOrder[]
  pagination: AdminPagination
}

export interface AdminOrderDetailResponse {
  success: boolean
  order: AdminOrder
}

export type CustomRequestStatus =
  | 'pending'
  | 'contacted'
  | 'quoted'
  | 'approved'
  | 'completed'
  | 'cancelled'

export interface AdminCustomRequest {
  requestId: string
  name: string
  email: string
  phone: string
  apparelType: string
  quantity: number
  sizeRange: string
  printingType: string
  description: string
  additionalRequirements?: string
  fileName?: string
  status: CustomRequestStatus
  createdAt: string
  updatedAt: string
}

export interface AdminCustomRequestsResponse {
  success: boolean
  requests: AdminCustomRequest[]
  pagination: AdminPagination
}

export interface AdminCustomRequestDetailResponse {
  success: boolean
  request: AdminCustomRequest
}

export type BusinessRequestStatus =
  | 'pending'
  | 'contacted'
  | 'quoted'
  | 'approved'
  | 'completed'
  | 'cancelled'

export interface AdminBusinessRequest {
  requestId: string
  name: string
  organization: string
  email: string
  phone: string
  organizationType: string
  apparelRequired: string
  quantity: string
  requiredBy: string
  brandingRequirements: string
  details?: string
  status: BusinessRequestStatus
  createdAt: string
  updatedAt: string
}

export interface AdminBusinessRequestsResponse {
  success: boolean
  requests: AdminBusinessRequest[]
  pagination: AdminPagination
}

export interface AdminBusinessRequestDetailResponse {
  success: boolean
  request: AdminBusinessRequest
}

interface RawApiResponse {
  success?: boolean
  message?: string
  token?: string
  user?: {
    id?: string
    userId?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    role?: string
  }
  orders?: AdminOrder[]
  order?: AdminOrder
  products?: AdminProduct[]
  product?: AdminProduct
  customers?: AdminCustomerAccount[]
  customer?: AdminCustomerAccount
  requests?: AdminCustomRequest[] | AdminBusinessRequest[]
  request?: AdminCustomRequest | AdminBusinessRequest
  pagination?: AdminPagination
}

/**
 * Retrieves the stored admin JWT token from localStorage.
 */
export function getAdminAuthToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_AUTH_TOKEN_KEY)
  } catch (err) {
    console.error('Failed to retrieve admin auth token from storage:', err)
    return null
  }
}

/**
 * Stores the admin JWT token in localStorage.
 */
export function setAdminAuthToken(token: string): void {
  try {
    localStorage.setItem(ADMIN_AUTH_TOKEN_KEY, token)
  } catch (err) {
    console.error('Failed to store admin auth token:', err)
  }
}

/**
 * Clears the admin JWT token from localStorage.
 */
export function clearAdminAuthToken(): void {
  try {
    localStorage.removeItem(ADMIN_AUTH_TOKEN_KEY)
  } catch (err) {
    console.error('Failed to clear admin auth token from storage:', err)
  }
}

/**
 * Retrieves the cached admin user profile from localStorage.
 */
export function getStoredAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AdminUser
    if (parsed && parsed.role === 'admin' && parsed.userId && parsed.email) {
      return parsed
    }
    return null
  } catch (err) {
    console.error('Failed to retrieve admin user from storage:', err)
    return null
  }
}

/**
 * Stores the admin user profile cache in localStorage.
 */
export function setStoredAdminUser(user: AdminUser): void {
  try {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))
  } catch (err) {
    console.error('Failed to store admin user in storage:', err)
  }
}

/**
 * Clears the cached admin user profile from localStorage.
 */
export function clearStoredAdminUser(): void {
  try {
    localStorage.removeItem(ADMIN_USER_KEY)
  } catch (err) {
    console.error('Failed to clear admin user from storage:', err)
  }
}

/**
 * Calls POST /api/auth/admin/login to authenticate admin credentials.
 * Authoritative admin role is verified server-side.
 */
export async function adminLogin(
  credentials: AdminLoginRequest
): Promise<AdminLoginResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    let data: RawApiResponse | null = null
    try {
      data = (await response.json()) as RawApiResponse
    } catch {
      // Failed to parse response body as JSON
    }

    if (!response.ok || !data?.success) {
      if (response.status === 400) {
        throw new Error(data?.message || 'Email address and password are required.')
      }
      if (response.status === 401) {
        throw new Error(data?.message || 'Invalid email or password.')
      }
      if (response.status === 403) {
        throw new Error(data?.message || 'Admin access required.')
      }
      if (response.status === 500) {
        throw new Error(data?.message || 'Server error while processing admin login.')
      }
      throw new Error(data?.message || 'Admin login failed. Please try again.')
    }

    if (!data.token || !data.user || data.user.role !== 'admin') {
      throw new Error('Admin authorization failed. Invalid server response.')
    }

    return {
      success: true,
      message: data.message || 'Admin login successful.',
      token: data.token,
      user: {
        userId: data.user.userId || data.user.id || '',
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        role: 'admin',
      },
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please check your network and try again.')
      }
      throw err
    }
    throw new Error('Unable to connect to the server. Please try again.')
  }
}

/**
 * Validates the admin session against the server by fetching the profile.
 * Calls GET /api/auth/me using the admin Bearer token.
 * Verifies that the returned user possesses role === 'admin'.
 */
export async function fetchAdminProfile(token: string): Promise<AdminUser | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return null
    }

    let data: RawApiResponse | null = null
    try {
      data = (await response.json()) as RawApiResponse
    } catch {
      return null
    }

    if (!data?.success || !data?.user) {
      return null
    }

    // Strict authoritative server check
    if (data.user.role !== 'admin') {
      return null
    }

    return {
      userId: data.user.userId || data.user.id || '',
      firstName: data.user.firstName || '',
      lastName: data.user.lastName || '',
      email: data.user.email || '',
      phone: data.user.phone || '',
      role: 'admin',
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    console.error('Failed to validate admin profile:', err)
    return null
  }
}

/**
 * Generic helper to execute an authenticated admin HTTP request.
 */
async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminAuthToken()
  if (!token) {
    throw new Error('Authentication required. Please sign in to admin.')
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

    let data: RawApiResponse | null = null
    try {
      data = (await response.json()) as RawApiResponse
    } catch {
      // Non-JSON response
    }

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
        throw new Error(data?.message || 'Resource not found.')
      }
      throw new Error(data?.message || 'Admin request failed.')
    }

    return data as unknown as T
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.')
      }
      throw err
    }
    throw new Error('Unable to connect to the server. Please try again.')
  }
}

// =========================================================================
// ADMIN ORDERS API METHODS
// =========================================================================

export async function fetchAdminOrders(params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}): Promise<AdminOrdersResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.status && params.status !== 'all') query.set('status', params.status)
  if (params?.search && params.search.trim()) query.set('search', params.search.trim())

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return adminFetch<AdminOrdersResponse>(`/admin/orders${queryString}`)
}

export async function fetchAdminOrderById(orderId: string): Promise<AdminOrderDetailResponse> {
  return adminFetch<AdminOrderDetailResponse>(`/admin/orders/${encodeURIComponent(orderId)}`)
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: AdminOrderStatus
): Promise<{ success: boolean; message: string; order: AdminOrder }> {
  return adminFetch<{ success: boolean; message: string; order: AdminOrder }>(
    `/admin/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  )
}

export async function updateAdminOrderTracking(
  orderId: string,
  tracking: { trackingNumber?: string; carrier?: string }
): Promise<{ success: boolean; message: string; order: AdminOrder }> {
  return adminFetch<{ success: boolean; message: string; order: AdminOrder }>(
    `/admin/orders/${encodeURIComponent(orderId)}/tracking`,
    {
      method: 'PATCH',
      body: JSON.stringify(tracking),
    }
  )
}

// =========================================================================
// ADMIN CUSTOM APPAREL REQUESTS API METHODS
// =========================================================================

export async function fetchAdminCustomRequests(params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}): Promise<AdminCustomRequestsResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.status && params.status !== 'all') query.set('status', params.status)
  if (params?.search && params.search.trim()) query.set('search', params.search.trim())

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return adminFetch<AdminCustomRequestsResponse>(`/admin/custom-requests${queryString}`)
}

export async function fetchAdminCustomRequestById(
  requestId: string
): Promise<AdminCustomRequestDetailResponse> {
  return adminFetch<AdminCustomRequestDetailResponse>(
    `/admin/custom-requests/${encodeURIComponent(requestId)}`
  )
}

export async function updateAdminCustomRequestStatus(
  requestId: string,
  status: CustomRequestStatus
): Promise<{ success: boolean; message: string; request: AdminCustomRequest }> {
  return adminFetch<{ success: boolean; message: string; request: AdminCustomRequest }>(
    `/admin/custom-requests/${encodeURIComponent(requestId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  )
}

// =========================================================================
// ADMIN BUSINESS BRANDING REQUESTS API METHODS
// =========================================================================

export async function fetchAdminBusinessRequests(params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}): Promise<AdminBusinessRequestsResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.status && params.status !== 'all') query.set('status', params.status)
  if (params?.search && params.search.trim()) query.set('search', params.search.trim())

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return adminFetch<AdminBusinessRequestsResponse>(`/admin/business-requests${queryString}`)
}

export async function fetchAdminBusinessRequestById(
  requestId: string
): Promise<AdminBusinessRequestDetailResponse> {
  return adminFetch<AdminBusinessRequestDetailResponse>(
    `/admin/business-requests/${encodeURIComponent(requestId)}`
  )
}

export async function updateAdminBusinessRequestStatus(
  requestId: string,
  status: BusinessRequestStatus
): Promise<{ success: boolean; message: string; request: AdminBusinessRequest }> {
  return adminFetch<{ success: boolean; message: string; request: AdminBusinessRequest }>(
    `/admin/business-requests/${encodeURIComponent(requestId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  )
}

// =========================================================================
// PRODUCT MANAGEMENT (ADMIN)
// =========================================================================

export type AdminProductCategory = 'Streetwear' | 'Gaming' | 'Gymwear'

export interface AdminProduct {
  _id?: string
  id: string
  name: string
  category: AdminProductCategory
  price: number
  image: string
  description: string
  available: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AdminProductsResponse {
  success: boolean
  products: AdminProduct[]
  pagination: AdminPagination
}

export interface AdminProductDetailResponse {
  success: boolean
  product: AdminProduct
}

export interface CreateAdminProductPayload {
  id?: string
  name: string
  category: AdminProductCategory
  price: number
  image: string
  description: string
  available?: boolean
}

export interface UpdateAdminProductPayload {
  name?: string
  category?: AdminProductCategory
  price?: number
  image?: string
  description?: string
  available?: boolean
}

export interface DeleteAdminProductResponse {
  success: boolean
  action: 'deleted' | 'deactivated'
  message: string
  product?: AdminProduct | { id: string; name: string }
}

export async function fetchAdminProducts(params?: {
  page?: number
  limit?: number
  category?: string
  available?: string
  search?: string
}): Promise<AdminProductsResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.category && params.category !== 'All') query.set('category', params.category)
  if (params?.available && params.available !== 'all') query.set('available', params.available)
  if (params?.search && params.search.trim()) query.set('search', params.search.trim())

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return adminFetch<AdminProductsResponse>(`/admin/products${queryString}`)
}

export async function fetchAdminProductById(id: string): Promise<AdminProductDetailResponse> {
  return adminFetch<AdminProductDetailResponse>(`/admin/products/${encodeURIComponent(id)}`)
}

export async function createAdminProduct(payload: CreateAdminProductPayload): Promise<{
  success: boolean
  message: string
  product: AdminProduct
}> {
  return adminFetch<{ success: boolean; message: string; product: AdminProduct }>(
    '/admin/products',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
}

export async function updateAdminProduct(
  id: string,
  payload: UpdateAdminProductPayload
): Promise<{
  success: boolean
  message: string
  product: AdminProduct
}> {
  return adminFetch<{ success: boolean; message: string; product: AdminProduct }>(
    `/admin/products/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  )
}

export async function deleteAdminProduct(
  id: string,
  hard?: boolean
): Promise<DeleteAdminProductResponse> {
  const queryString = hard ? '?hard=true' : ''
  return adminFetch<DeleteAdminProductResponse>(
    `/admin/products/${encodeURIComponent(id)}${queryString}`,
    {
      method: 'DELETE',
    }
  )
}

// =========================================================================
// CUSTOMER MANAGEMENT (ADMIN)
// =========================================================================

export interface AdminCustomerAccount {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'customer' | string
  orderCount: number
  createdAt: string
  updatedAt?: string
}

export interface AdminCustomersResponse {
  success: boolean
  customers: AdminCustomerAccount[]
  pagination: AdminPagination
}

export interface AdminCustomerDetailResponse {
  success: boolean
  customer: AdminCustomerAccount
}

export interface AdminCustomerOrdersResponse {
  success: boolean
  orders: AdminOrder[]
}

export interface UpdateAdminCustomerPayload {
  firstName?: string
  lastName?: string
  phone?: string
}

// Aliases matching Step 8.15.2 naming conventions
export type AdminCustomerOrder = AdminOrder
export type AdminCustomerListResponse = AdminCustomersResponse
export type CustomerPagination = AdminPagination
export type UpdateCustomerPayload = UpdateAdminCustomerPayload

export async function fetchAdminCustomers(params?: {
  page?: number
  limit?: number
  search?: string
}): Promise<AdminCustomersResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.search && params.search.trim()) query.set('search', params.search.trim())

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return adminFetch<AdminCustomersResponse>(`/admin/customers${queryString}`)
}

export async function fetchAdminCustomerById(
  userId: string
): Promise<AdminCustomerDetailResponse> {
  return adminFetch<AdminCustomerDetailResponse>(`/admin/customers/${encodeURIComponent(userId)}`)
}

export async function fetchAdminCustomerOrders(
  userId: string
): Promise<AdminCustomerOrdersResponse> {
  return adminFetch<AdminCustomerOrdersResponse>(
    `/admin/customers/${encodeURIComponent(userId)}/orders`
  )
}

export async function updateAdminCustomer(
  userId: string,
  payload: UpdateAdminCustomerPayload
): Promise<{
  success: boolean
  message: string
  customer: AdminCustomerAccount
}> {
  return adminFetch<{ success: boolean; message: string; customer: AdminCustomerAccount }>(
    `/admin/customers/${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  )
}

// =========================================================================
// ANALYTICS DASHBOARD (ADMIN)
// =========================================================================

export interface AdminAnalyticsOverview {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  averageOrderValue: number
  deliveredRevenue: number
  pendingRevenue: number
  cancelledRevenue: number
}

export interface AdminAnalyticsOrdersByStatus {
  pending: number
  confirmed: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}

export interface AdminAnalyticsRequests {
  customApparel: number
  businessBranding: number
}

export interface AdminDailySalesItem {
  date: string
  revenue: number
  orders: number
}

export interface AdminSalesByCategoryItem {
  category: string
  revenue: number
  orders: number
  itemsSold: number
}

export interface AdminTopProductItem {
  productId: string
  productName: string
  orders: number
  itemsSold: number
  revenue: number
}

export interface AdminAnalyticsResponse {
  success: boolean
  overview: AdminAnalyticsOverview
  ordersByStatus: AdminAnalyticsOrdersByStatus
  requests: AdminAnalyticsRequests
  dailySales: AdminDailySalesItem[]
  salesByCategory: AdminSalesByCategoryItem[]
  topProducts: AdminTopProductItem[]
}

/**
 * Retrieves aggregate business analytics from MongoDB.
 * Protected by requireAuth and requireAdmin server-side.
 */
export async function fetchAdminAnalytics(): Promise<AdminAnalyticsResponse> {
  return adminFetch<AdminAnalyticsResponse>('/admin/analytics/overview')
}

// =========================================================================
// COMMAND CENTER DASHBOARD (ADMIN)
// =========================================================================

export interface AdminDashboardToday {
  revenue: number
  orders: number
}

export interface AdminDashboardCustomers {
  total: number
  newToday: number
}

export interface AdminDashboardOrders {
  pending: number
  confirmed: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}

export interface AdminDashboardRequests {
  customApparelPending: number
  businessBrandingPending: number
}

export interface AdminDashboardSummaryData {
  today: AdminDashboardToday
  customers: AdminDashboardCustomers
  orders: AdminDashboardOrders
  requests: AdminDashboardRequests
}

export interface AdminDashboardRecentOrder {
  orderId: string
  customerName: string
  customerEmail: string
  total: number
  status: AdminOrderStatus
  createdAt: string
  itemCount: number
}

export interface AdminDashboardRecentCustomer {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
}

export interface AdminDashboardRecentRequest {
  requestId: string
  requestType: 'custom_apparel' | 'business_branding'
  name: string
  email: string
  status: string
  createdAt: string
  detail?: string
}

export interface AdminDashboardSummaryResponse {
  success: boolean
  summary: AdminDashboardSummaryData
  recentOrders: AdminDashboardRecentOrder[]
  recentCustomers: AdminDashboardRecentCustomer[]
  recentRequests: AdminDashboardRecentRequest[]
}

/**
 * Retrieves real-time command center summary from MongoDB.
 * Protected by requireAuth and requireAdmin server-side.
 */
export async function fetchAdminDashboardSummary(): Promise<AdminDashboardSummaryResponse> {
  return adminFetch<AdminDashboardSummaryResponse>('/admin/dashboard/summary')
}

// =========================================================================
// COUPONS & DISCOUNTS MANAGEMENT (ADMIN)
// =========================================================================

export type AdminDiscountType = 'percentage' | 'fixed'
export type AdminCouponStatus =
  | 'disabled'
  | 'scheduled'
  | 'active'
  | 'expired'
  | 'exhausted'

export interface AdminCoupon {
  _id: string
  code: string
  description?: string
  discountType: AdminDiscountType
  discountValue: number
  minimumOrderValue: number
  maximumDiscount?: number | null
  startDate: string
  expiryDate: string
  usageLimit?: number | null
  perCustomerLimit?: number | null
  usageCount: number
  active: boolean
  status: AdminCouponStatus
  createdAt: string
  updatedAt: string
}

export interface AdminCouponCreateInput {
  code: string
  description?: string
  discountType: AdminDiscountType
  discountValue: number
  minimumOrderValue?: number
  maximumDiscount?: number | null
  startDate: string
  expiryDate: string
  usageLimit?: number | null
  perCustomerLimit?: number | null
  active?: boolean
}

export interface AdminCouponUpdateInput {
  description?: string
  discountType?: AdminDiscountType
  discountValue?: number
  minimumOrderValue?: number
  maximumDiscount?: number | null
  startDate?: string
  expiryDate?: string
  usageLimit?: number | null
  perCustomerLimit?: number | null
  active?: boolean
}

export interface AdminCouponsFilterParams {
  page?: number
  limit?: number
  search?: string
  active?: boolean | string
  discountType?: string
  status?: string
}

export interface AdminCouponsResponse {
  success: boolean
  coupons: AdminCoupon[]
  pagination: AdminPagination
}

export interface AdminCouponDetailResponse {
  success: boolean
  coupon: AdminCoupon
}

export interface AdminCouponActionResponse {
  success: boolean
  message: string
  coupon?: AdminCoupon
}

/**
 * Retrieves a paginated list of coupons with optional filters and search.
 */
export async function fetchAdminCoupons(
  params: AdminCouponsFilterParams = {}
): Promise<AdminCouponsResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', params.page.toString())
  if (params.limit) query.set('limit', params.limit.toString())
  if (params.search) query.set('search', params.search.trim())
  if (params.active !== undefined && params.active !== '') {
    query.set('active', params.active.toString())
  }
  if (params.discountType && params.discountType !== 'all') {
    query.set('discountType', params.discountType)
  }
  if (params.status && params.status !== 'all') {
    query.set('status', params.status)
  }

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return adminFetch<AdminCouponsResponse>(`/admin/coupons${queryString}`)
}

/**
 * Retrieves details for a specific coupon by ID.
 */
export async function fetchAdminCouponById(
  couponId: string
): Promise<AdminCouponDetailResponse> {
  return adminFetch<AdminCouponDetailResponse>(`/admin/coupons/${couponId}`)
}

/**
 * Creates a new promotional coupon.
 */
export async function createAdminCoupon(
  data: AdminCouponCreateInput
): Promise<AdminCouponActionResponse> {
  return adminFetch<AdminCouponActionResponse>('/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Updates an existing coupon configuration.
 */
export async function updateAdminCoupon(
  couponId: string,
  data: AdminCouponUpdateInput
): Promise<AdminCouponActionResponse> {
  return adminFetch<AdminCouponActionResponse>(`/admin/coupons/${couponId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Deletes an unused coupon. Used coupons (usageCount > 0) are rejected by server.
 */
export async function deleteAdminCoupon(
  couponId: string
): Promise<AdminCouponActionResponse> {
  return adminFetch<AdminCouponActionResponse>(`/admin/coupons/${couponId}`, {
    method: 'DELETE',
  })
}

// =========================================================================
// REVIEWS MANAGEMENT (ADMIN)
// =========================================================================
export {
  fetchAdminReviews,
  fetchAdminReviewById,
  updateAdminReviewStatus,
  deleteAdminReview,
  type AdminReview,
  type AdminReviewsFilterParams,
  type AdminReviewsResponse,
  type AdminReviewDetailResponse,
} from './reviewApi'
