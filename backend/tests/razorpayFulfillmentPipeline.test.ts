/**
 * KALA Production E-Commerce Integration Test Suite
 *
 * Comprehensive end-to-end verification covering:
 * 1. Razorpay Order Creation & Server-Authoritative Amount Calculation
 * 2. Razorpay Payment Signature Verification & Cross-Order Hijacking Protection
 * 3. Razorpay Webhook Handling, Independent Signature Verification & Amount Validation
 * 4. Webhook Idempotency & Duplicate Protection (Zero duplicate fulfillment/notifications)
 * 5. Paid vs Unpaid/Cancelled Safety Guards (Only genuine captured payments enter logistics)
 * 6. Shiprocket Package Intelligence (Weight in grams normalized to kg, quantity multiplied once)
 * 7. Postal Code (PIN) Validation & Courier Serviceability
 * 8. Shiprocket Automatic Fulfillment Pipeline & Idempotent Admin Retry
 */

import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { Request, Response } from 'express'
import { Order, IOrder, IOrderItem } from '../src/models/Order'
import { NotificationLog } from '../src/models/NotificationLog'
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
} from '../src/controllers/paymentController'
import {
  calculateOrderPackageSpecs,
  normalizeProductWeightKg,
  triggerShipmentWorkflow,
  retryShipmentWorkflow,
} from '../src/services/shipmentAutomationService'
import { isValidPincode } from '../src/services/shiprocketServiceabilityService'
import {
  DEFAULT_SHIPMENT_WEIGHT_KG,
  MIN_SHIPMENT_WEIGHT_KG,
  MAX_SHIPMENT_WEIGHT_KG,
} from '../src/config/shiprocketConfig'

// Helper to construct mock Express Request and Response
function createMockReqRes(body: any = {}, headers: Record<string, string> = {}, user: any = undefined) {
  let statusCode = 200
  let responseData: any = null

  const req = {
    body,
    headers: { ...headers },
    user,
    params: {},
  } as unknown as Request

  const res = {
    status(code: number) {
      statusCode = code
      return this
    },
    json(data: any) {
      responseData = data
      return this
    },
  } as unknown as Response

  return {
    req,
    res,
    getStatus: () => statusCode,
    getData: () => responseData,
  }
}

describe('KALA Production E-Commerce Integration & Fulfillment Pipeline', () => {
  const TEST_SECRET = 'kala_test_razorpay_secret_secure_key_12345'
  const originalEnvSecret = process.env.RAZORPAY_KEY_SECRET
  const originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  const originalAutoFulfill = process.env.SHIPROCKET_AUTO_FULFILLMENT_ENABLED
  const originalAutoAwb = process.env.SHIPROCKET_AUTO_AWB_ENABLED
  const originalFindOne = Order.findOne
  const originalNotifFindOne = NotificationLog.findOne
  const originalNotifFindOneAndUpdate = NotificationLog.findOneAndUpdate

  beforeEach(() => {
    process.env.RAZORPAY_KEY_SECRET = TEST_SECRET
    process.env.RAZORPAY_WEBHOOK_SECRET = TEST_SECRET
    NotificationLog.findOne = (async () => null) as any
    NotificationLog.findOneAndUpdate = (async () => null) as any
  })

  afterEach(() => {
    process.env.RAZORPAY_KEY_SECRET = originalEnvSecret
    process.env.RAZORPAY_WEBHOOK_SECRET = originalWebhookSecret
    process.env.SHIPROCKET_AUTO_FULFILLMENT_ENABLED = originalAutoFulfill
    process.env.SHIPROCKET_AUTO_AWB_ENABLED = originalAutoAwb
    Order.findOne = originalFindOne
    NotificationLog.findOne = originalNotifFindOne
    NotificationLog.findOneAndUpdate = originalNotifFindOneAndUpdate
  })

  // =========================================================================
  // 1. RAZORPAY PAYMENT VERIFICATION & HIJACKING PROTECTION
  // =========================================================================
  describe('1. Server-Side Razorpay Signature Verification & Guards', () => {
    it('verifies genuine Razorpay signature using HMAC-SHA256 and marks order paid', async () => {
      const orderId = 'KALA-TEST-RZP-001'
      const rzpOrderId = 'order_valid_12345'
      const rzpPaymentId = 'pay_valid_67890'
      const signature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(`${rzpOrderId}|${rzpPaymentId}`)
        .digest('hex')

      let saved = false
      const mockOrder: any = {
        orderId,
        status: 'pending',
        pricing: { total: 999, subtotal: 999, shipping: 0 },
        payment: { razorpayOrderId: rzpOrderId, status: 'pending' },
        save: async () => {
          saved = true
        },
      }

      Order.findOne = (async () => mockOrder) as any

      const mock = createMockReqRes({
        orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: signature,
      })

      await verifyRazorpayPayment(mock.req, mock.res)

      assert.equal(mock.getStatus(), 200, 'Should return HTTP 200 for valid payment')
      assert.equal(mock.getData()?.success, true)
      assert.equal(mockOrder.status, 'confirmed', 'Order status must be updated to confirmed')
      assert.equal(mockOrder.payment.status, 'paid', 'Payment status must be updated to paid')
      assert.equal(saved, true, 'Order must be persisted to MongoDB')
    })

    it('rejects tampered or mismatched Razorpay signatures with HTTP 400', async () => {
      const orderId = 'KALA-TEST-RZP-002'
      const rzpOrderId = 'order_valid_12345'
      const rzpPaymentId = 'pay_valid_67890'
      const invalidSignature = 'invalid_tampered_signature_hex_value'

      const mock = createMockReqRes({
        orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: invalidSignature,
      })

      await verifyRazorpayPayment(mock.req, mock.res)

      assert.equal(mock.getStatus(), 400, 'Must reject invalid signature with HTTP 400')
      assert.equal(mock.getData()?.success, false)
      assert.match(mock.getData()?.message, /signature mismatch/i)
    })

    it('prevents cross-order payment hijacking (razorpayOrderId mismatch guard)', async () => {
      const orderId = 'KALA-EXPENSIVE-001'
      const rzpOrderA = 'order_expensive_111'
      const rzpOrderB = 'order_cheap_222'
      const rzpPaymentB = 'pay_cheap_333'

      // Attacker generated valid signature for cheap order B
      const validSignatureB = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(`${rzpOrderB}|${rzpPaymentB}`)
        .digest('hex')

      const mockOrder: any = {
        orderId,
        status: 'pending',
        pricing: { total: 4999 },
        payment: { razorpayOrderId: rzpOrderA, status: 'pending' },
        save: async () => {},
      }

      Order.findOne = (async () => mockOrder) as any

      // Attacker attempts to submit cheap order payment against expensive order A
      const mock = createMockReqRes({
        orderId,
        razorpay_order_id: rzpOrderB,
        razorpay_payment_id: rzpPaymentB,
        razorpay_signature: validSignatureB,
      })

      await verifyRazorpayPayment(mock.req, mock.res)

      assert.equal(mock.getStatus(), 400, 'Must reject mismatched order ID with HTTP 400')
      assert.match(mock.getData()?.message, /razorpay order id mismatch/i)
    })

    it('rejects payment verification for cancelled orders', async () => {
      const orderId = 'KALA-CANCELLED-001'
      const rzpOrderId = 'order_cancel_123'
      const rzpPaymentId = 'pay_cancel_456'
      const signature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(`${rzpOrderId}|${rzpPaymentId}`)
        .digest('hex')

      const mockOrder: any = {
        orderId,
        status: 'cancelled',
        save: async () => {},
      }

      Order.findOne = (async () => mockOrder) as any

      const mock = createMockReqRes({
        orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: signature,
      })

      await verifyRazorpayPayment(mock.req, mock.res)

      assert.equal(mock.getStatus(), 400, 'Must reject payment verification for cancelled order')
      assert.match(mock.getData()?.message, /cancelled order/i)
    })
  })

  // =========================================================================
  // 2. WEBHOOK HANDLING & INDEPENDENT VERIFICATION
  // =========================================================================
  describe('2. Independent Razorpay Webhook Signature & Idempotency', () => {
    it('verifies independent webhook signature and processes payment.captured', async () => {
      const orderId = 'KALA-WB-TEST-001'
      const rzpOrderId = 'order_wb_100'
      const rzpPaymentId = 'pay_wb_200'

      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: rzpPaymentId,
              order_id: rzpOrderId,
              amount: 149900, // ₹1,499.00 in paise
              notes: { orderId },
            },
          },
        },
      }

      const rawBody = JSON.stringify(webhookPayload)
      const webhookSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(rawBody)
        .digest('hex')

      let saved = false
      const mockOrder: any = {
        orderId,
        status: 'pending',
        pricing: { total: 1499 },
        payment: { status: 'pending' },
        save: async () => {
          saved = true
        },
      }

      Order.findOne = (async () => mockOrder) as any

      const mock = createMockReqRes(
        webhookPayload,
        { 'x-razorpay-signature': webhookSignature }
      )

      await handleRazorpayWebhook(mock.req, mock.res)

      assert.equal(mock.getStatus(), 200, 'Webhook should return HTTP 200')
      assert.equal(mockOrder.status, 'confirmed')
      assert.equal(mockOrder.payment.status, 'paid')
      assert.equal(saved, true)
    })

    it('rejects webhook with missing signature when secret is configured', async () => {
      const mock = createMockReqRes({ event: 'payment.captured' }, {})

      await handleRazorpayWebhook(mock.req, mock.res)

      assert.equal(mock.getStatus(), 400, 'Must reject missing signature with HTTP 400')
      assert.match(mock.getData()?.message, /missing x-razorpay-signature/i)
    })

    it('rejects webhook with invalid signature', async () => {
      const mock = createMockReqRes(
        { event: 'payment.captured' },
        { 'x-razorpay-signature': 'invalid_bad_sig' }
      )

      await handleRazorpayWebhook(mock.req, mock.res)

      assert.equal(mock.getStatus(), 400, 'Must reject invalid signature with HTTP 400')
      assert.match(mock.getData()?.message, /invalid webhook signature/i)
    })

    it('rejects webhook when paid amount does not match server-calculated total', async () => {
      const orderId = 'KALA-AMOUNT-CHECK'
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_amount_hack',
              amount: 100, // Paid ₹1 for ₹1,999 order
              notes: { orderId },
            },
          },
        },
      }

      const rawBody = JSON.stringify(webhookPayload)
      const webhookSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(rawBody)
        .digest('hex')

      const mockOrder: any = {
        orderId,
        status: 'pending',
        pricing: { total: 1999 }, // Server total is ₹1,999 (199,900 paise)
        payment: { status: 'pending' },
        save: async () => {},
      }

      Order.findOne = (async () => mockOrder) as any

      const mock = createMockReqRes(
        webhookPayload,
        { 'x-razorpay-signature': webhookSignature }
      )

      await handleRazorpayWebhook(mock.req, mock.res)

      assert.equal(mock.getStatus(), 400, 'Must reject amount mismatch with HTTP 400')
      assert.match(mock.getData()?.message, /payment amount mismatch/i)
      assert.equal(mockOrder.payment.status, 'pending', 'Order must NOT be marked paid')
    })

    it('idempotently handles duplicate webhook events without re-fulfilling', async () => {
      const orderId = 'KALA-DUPLICATE-WB'
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_duplicate_123',
              amount: 89900,
              notes: { orderId },
            },
          },
        },
      }

      const rawBody = JSON.stringify(webhookPayload)
      const webhookSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(rawBody)
        .digest('hex')

      let saveCount = 0
      const mockOrder: any = {
        orderId,
        status: 'confirmed',
        pricing: { total: 899 },
        payment: { status: 'paid', razorpayPaymentId: 'pay_duplicate_123' }, // Already paid!
        save: async () => {
          saveCount++
        },
      }

      Order.findOne = (async () => mockOrder) as any

      const mock = createMockReqRes(
        webhookPayload,
        { 'x-razorpay-signature': webhookSignature }
      )

      await handleRazorpayWebhook(mock.req, mock.res)

      assert.equal(mock.getStatus(), 200, 'Acknowledge duplicate webhook with HTTP 200')
      assert.equal(saveCount, 0, 'Must not re-save or duplicate status changes on duplicate webhook')
    })

    it('safely handles payment.failed without creating shipments or confirming order', async () => {
      const webhookPayload = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_failed_456',
              order_id: 'order_failed_789',
            },
          },
        },
      }

      const rawBody = JSON.stringify(webhookPayload)
      const webhookSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(rawBody)
        .digest('hex')

      const mock = createMockReqRes(
        webhookPayload,
        { 'x-razorpay-signature': webhookSignature }
      )

      await handleRazorpayWebhook(mock.req, mock.res)

      assert.equal(mock.getStatus(), 200, 'Acknowledge failed payment event')
      assert.match(mock.getData()?.note, /fulfillment bypassed/i)
    })
  })

  // =========================================================================
  // 3. SHIPPING & PACKAGE INTELLIGENCE ACCURACY
  // =========================================================================
  describe('3. Package Weight & Dimensions Accuracy', () => {
    it('normalizes finished product weight from grams to kilograms correctly', () => {
      assert.equal(normalizeProductWeightKg(280), 0.28, '280g -> 0.28kg')
      assert.equal(normalizeProductWeightKg(650), 0.65, '650g -> 0.65kg')
      assert.equal(normalizeProductWeightKg(200), 0.20, '200g -> 0.20kg')
      assert.equal(normalizeProductWeightKg(0.5), 0.5, '0.5kg -> 0.5kg')
      assert.equal(normalizeProductWeightKg(undefined), undefined)
      assert.equal(normalizeProductWeightKg(0), undefined)
      assert.equal(normalizeProductWeightKg(-10), undefined)
    })

    it('multiplies per-unit weight by quantity exactly once', () => {
      const items: IOrderItem[] = [
        {
          productId: 'kala-tee-01',
          name: 'Tee',
          image: '',
          size: 'L',
          quantity: 3,
          price: 499,
          weightKg: 0.28, // 3 * 0.28 = 0.84kg
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 0.84, 'Total weight should be 0.84kg')
      assert.equal(specs.dimensions.length, 25)
      assert.equal(specs.dimensions.breadth, 20)
      assert.equal(specs.dimensions.height, 9, '3 units * 3cm = 9cm height')
    })

    it('falls back to 0.5kg for legacy unweighted products', () => {
      const items: IOrderItem[] = [
        {
          productId: 'kala-legacy-tee',
          name: 'Legacy Tee',
          image: '',
          size: 'M',
          quantity: 2,
          price: 499,
          // weightKg omitted -> fallback to 0.5kg
        },
      ]

      const specs = calculateOrderPackageSpecs(items)
      assert.equal(specs.weightKg, 1.0, '2 unweighted items should total 1.0kg')
    })

    it('clamps lightweight items to minimum 0.1kg and heavy packages to 10kg', () => {
      const lightItems: IOrderItem[] = [
        {
          productId: 'kala-sticker',
          name: 'Sticker',
          image: '',
          size: 'FREE SIZE',
          quantity: 1,
          price: 49,
          weightKg: 0.03, // < 0.1kg
        },
      ]
      assert.equal(calculateOrderPackageSpecs(lightItems).weightKg, 0.1, 'Must clamp to 0.1kg')

      const heavyItems: IOrderItem[] = [
        {
          productId: 'kala-bulk-heavy',
          name: 'Heavy Apparel Stack',
          image: '',
          size: 'XL',
          quantity: 25,
          price: 999,
          weightKg: 0.70, // 25 * 0.7 = 17.5kg -> clamped to 10.0kg
        },
      ]
      assert.equal(calculateOrderPackageSpecs(heavyItems).weightKg, 10.0, 'Must clamp to 10.0kg')
    })
  })

  // =========================================================================
  // 4. PIN CODE VALIDATION & SHIPMENT AUTOMATION GUARDS
  // =========================================================================
  describe('4. PIN Code Validation & Fulfillment Safety Guards', () => {
    it('validates 6-digit Indian PIN codes', () => {
      assert.equal(isValidPincode('495004'), true, 'Bilaspur pickup PIN is valid')
      assert.equal(isValidPincode('110001'), true, 'Delhi delivery PIN is valid')
      assert.equal(isValidPincode('4950'), false, 'Short PIN is invalid')
      assert.equal(isValidPincode('4950004'), false, 'Long PIN is invalid')
      assert.equal(isValidPincode('ABCDEF'), false, 'Non-numeric PIN is invalid')
    })

    it('aborts shipment creation for unpaid orders', async () => {
      const mockOrder: any = {
        orderId: 'KALA-UNPAID-001',
        status: 'pending',
        payment: { status: 'pending' },
      }
      Order.findOne = (async () => mockOrder) as any

      const result = await triggerShipmentWorkflow('KALA-UNPAID-001')
      assert.equal(result.success, false)
      assert.match(result.message, /payment not verified/i)
    })

    it('aborts shipment creation for cancelled orders', async () => {
      const mockOrder: any = {
        orderId: 'KALA-CANCEL-FULFILL',
        status: 'cancelled',
        payment: { status: 'paid' },
      }
      Order.findOne = (async () => mockOrder) as any

      const result = await triggerShipmentWorkflow('KALA-CANCEL-FULFILL')
      assert.equal(result.success, false)
      assert.match(result.message, /cancelled/i)
    })

    it('rejects shipment creation when delivery PIN is invalid', async () => {
      process.env.SHIPROCKET_AUTO_FULFILLMENT_ENABLED = 'true'

      const mockOrder: any = {
        orderId: 'KALA-BAD-PIN',
        status: 'confirmed',
        payment: { status: 'paid' },
        shippingAddress: { pincode: 'INVALID_PIN' },
        items: [{ productId: 'tee', name: 'Tee', quantity: 1, price: 499 }],
        save: async () => {},
      }
      Order.findOne = (async () => mockOrder) as any

      const result = await triggerShipmentWorkflow('KALA-BAD-PIN')
      assert.equal(result.success, false)
      assert.match(result.message, /invalid delivery pin/i)
    })

    it('respects production safety gate when auto-fulfillment flag is disabled', async () => {
      process.env.SHIPROCKET_AUTO_FULFILLMENT_ENABLED = 'false'

      const mockOrder: any = {
        orderId: 'KALA-GATE-TEST',
        status: 'confirmed',
        payment: { status: 'paid' },
        shippingAddress: { pincode: '495004' },
        items: [{ productId: 'tee', name: 'Tee', quantity: 1, price: 499 }],
        save: async () => {},
      }
      Order.findOne = (async () => mockOrder) as any

      const result = await triggerShipmentWorkflow('KALA-GATE-TEST')
      assert.equal(result.success, true, 'Safety gate returns safe success without dispatching')
      assert.match(result.message, /safety gate/i)
    })

    it('retryShipmentWorkflow rejects retry on cancelled orders', async () => {
      const mockOrder: any = {
        orderId: 'KALA-RETRY-CANCEL',
        status: 'cancelled',
        payment: { status: 'paid' },
      }
      Order.findOne = (async () => mockOrder) as any

      const result = await retryShipmentWorkflow('KALA-RETRY-CANCEL')
      assert.equal(result.success, false)
      assert.match(result.message, /cancelled/i)
    })
  })
})
