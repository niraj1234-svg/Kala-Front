import { API_BASE_URL } from '../config/api'
import { getAuthToken } from './authApi'
import type { RazorpaySuccessResponse } from '../types/razorpay'

export interface CreateRazorpayOrderPayload {
  orderId?: string
  amount?: number // in paise (e.g. 100 = ₹1.00)
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export interface CreateRazorpayOrderResponse {
  success: boolean
  order_id: string
  amount: number
  currency: string
  receipt?: string
  key_id?: string
  message?: string
}

export interface VerifyPaymentPayload extends RazorpaySuccessResponse {
  orderId: string
}

export interface VerifyPaymentResponse {
  success: boolean
  message: string
  payment_id?: string
  order_id?: string
}

/**
 * Dynamically loads the Razorpay checkout script if not already present.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true))
      existingScript.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Calls backend to create a Razorpay order:
 * POST /api/create-order
 */
export async function createRazorpayOrder(
  payload: CreateRazorpayOrderPayload
): Promise<CreateRazorpayOrderResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const token = getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/create-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await response.json()

    if (!response.ok || !data.order_id) {
      const errorMessage = data?.message || 'Failed to initiate payment. Please try again.'
      throw new Error(errorMessage)
    }

    return data
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Payment initialization timed out. Please check your connection.')
    }
    throw new Error(err.message || 'Unable to initiate payment with Razorpay.')
  }
}

/**
 * Calls backend to verify Razorpay payment signature:
 * POST /api/verify-payment
 */
export async function verifyRazorpayPayment(
  payload: VerifyPaymentPayload
): Promise<VerifyPaymentResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const token = getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/verify-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await response.json()

    if (!response.ok || !data.success) {
      const errorMessage = data?.message || 'Payment signature verification failed.'
      throw new Error(errorMessage)
    }

    return data
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Payment verification timed out. Please contact support if your account was debited.')
    }
    throw new Error(err.message || 'Payment verification failed.')
  }
}
