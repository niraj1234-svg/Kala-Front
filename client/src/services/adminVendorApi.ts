import { API_BASE_URL } from '../config/api'
import { getAdminAuthToken } from './adminApi'
import type { EnrichedVendorApplication } from '../types/marketplace'

function getAdminHeaders(): HeadersInit {
  const token = getAdminAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export async function fetchAdminVendors(
  status?: string,
  search?: string
): Promise<{
  success: boolean
  vendors: EnrichedVendorApplication[]
  count: number
  message?: string
}> {
  const query = new URLSearchParams()
  if (status && status !== 'ALL') query.append('status', status)
  if (search) query.append('search', search)

  const queryString = query.toString() ? `?${query.toString()}` : ''
  const response = await fetch(`${API_BASE_URL}/admin/vendors${queryString}`, {
    headers: getAdminHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch vendor applications.')
  }
  return data
}

export async function approveAdminVendor(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin/vendors/${encodeURIComponent(id)}/approve`, {
    method: 'PUT',
    headers: getAdminHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to approve vendor.')
  }
  return data
}

export async function rejectAdminVendor(id: string, reason?: string) {
  const response = await fetch(`${API_BASE_URL}/admin/vendors/${encodeURIComponent(id)}/reject`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ reason }),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to reject vendor.')
  }
  return data
}

export async function suspendAdminVendor(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin/vendors/${encodeURIComponent(id)}/suspend`, {
    method: 'PUT',
    headers: getAdminHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to suspend vendor.')
  }
  return data
}

export async function fetchPendingProducts() {
  const response = await fetch(`${API_BASE_URL}/admin/products/pending`, {
    headers: getAdminHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch pending products.')
  }
  return data
}

export async function approvePendingProduct(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin/products/${encodeURIComponent(id)}/approve`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to approve product.')
  }
  return data
}

export async function rejectPendingProduct(id: string, reason?: string) {
  const response = await fetch(`${API_BASE_URL}/admin/products/${encodeURIComponent(id)}/reject`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ reason }),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to reject product.')
  }
  return data
}

export async function fetchPlatformSettings() {
  const response = await fetch(`${API_BASE_URL}/admin/settings`, {
    headers: getAdminHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch platform settings.')
  }
  return data
}

export async function updatePlatformCommission(commissionRate: number) {
  const response = await fetch(`${API_BASE_URL}/admin/settings/commission`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ commissionRate }),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update commission rate.')
  }
  return data
}

export async function fetchAllPayouts(status?: string) {
  const qs = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : ''
  const response = await fetch(`${API_BASE_URL}/admin/settings/payouts${qs}`, {
    headers: getAdminHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch payouts.')
  }
  return data
}

export async function updatePayoutStatusApi(id: string, payload: { status: string; referenceNumber?: string; notes?: string }) {
  const response = await fetch(`${API_BASE_URL}/admin/settings/payouts/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update payout status.')
  }
  return data
}
