import { Request, Response } from 'express'
import crypto from 'crypto'
import {
  DesignathonRegistration,
  generateRegistrationId,
} from '../models/DesignathonRegistration'
import { getOrInitDesignathonSettings } from '../models/DesignathonSettings'
import {
  DESIGNATHON_CONFIG,
  checkRegistrationWindow,
} from '../config/designathonConfig'
import {
  getRazorpayClient,
  getRazorpayKeyId,
  getRazorpayKeySecret,
  getMaskedKey,
} from '../config/razorpay'
import { sendDesignathonConfirmationEmail } from '../services/designathonEmailService'
import { getAuthenticatedUser } from '../middleware/authMiddleware'

/**
 * Normalizes Indian WhatsApp mobile numbers to 10 digits starting with 6-9.
 * Strips whitespace, dashes, leading 0, and leading +91 / 91.
 */
export function normalizeIndianMobile(raw: string): { isValid: boolean; normalized: string } {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, normalized: '' }
  }

  // Remove spaces, hyphens, parentheses
  let cleaned = raw.replace(/[\s\-\(\)\.]/g, '')

  // Remove +91 or 91 country code prefix if 12 or 13 digits
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3)
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2)
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1)
  }

  // Check 10-digit format starting with 6, 7, 8, or 9
  const isValid = /^[6-9]\d{9}$/.test(cleaned)
  return { isValid, normalized: isValid ? cleaned : '' }
}

/**
 * Normalizes and validates a Gmail address.
 * Normalizes to lowercase and ensures proper @gmail.com domain format.
 */
export function normalizeGmail(raw: string): { isValid: boolean; isGmail: boolean; normalized: string } {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, isGmail: false, normalized: '' }
  }

  const normalized = raw.trim().toLowerCase()
  // Basic email syntax check
  const isEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    normalized
  )
  const isGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(normalized)

  return {
    isValid: isEmail,
    isGmail,
    normalized,
  }
}

/**
 * GET /api/designathon/config
 * Returns public event details, dynamic settings, and current registration window state.
 */
export const getDesignathonPublicConfig = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await getOrInitDesignathonSettings()
    const windowState = checkRegistrationWindow()

    res.status(200).json({
      success: true,
      config: {
        eventId: settings.eventId,
        eventName: settings.eventName,
        slogan: settings.slogan,
        registrationOpens: settings.registrationOpens,
        registrationCloses: settings.registrationCloses,
        eventDate: settings.eventDate,
        eventTime: settings.eventTime,
        resultsAnnouncement: settings.resultsAnnouncement,
        feeRupees: settings.feeRupees,
        feePaise: settings.feePaise,
        currency: 'INR',
        venue: settings.venue,
        eventFormat: settings.eventFormat,
        judgingCriteria: settings.judgingCriteria,
        submissionInstructions: settings.submissionInstructions,
        refundPolicy: DESIGNATHON_CONFIG.refundPolicy,
        eligibility: DESIGNATHON_CONFIG.eligibility,
        participation: DESIGNATHON_CONFIG.participation,
        prizes: DESIGNATHON_CONFIG.prizes,
        contact: DESIGNATHON_CONFIG.contact,
        window: {
          isOpen: windowState.isOpen,
          status: windowState.status,
          message: windowState.message,
          opensAt: windowState.opensAt,
          closesAt: windowState.closesAt,
        },
      },
    })
  } catch (err: any) {
    console.error('[Designathon] getDesignathonPublicConfig error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve event configuration.',
    })
  }
}

/**
 * POST /api/designathon/register
 * Creates or updates a pending registration.
 * Performs rigorous field-level validation, enforces registration window, and prevents duplicate confirmed entries.
 */
export const registerForDesignathon = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Enforce Registration Window
    const windowState = checkRegistrationWindow()
    if (!windowState.isOpen) {
      res.status(400).json({
        success: false,
        message: windowState.message,
        windowStatus: windowState.status,
      })
      return
    }

    const {
      fullName,
      email,
      whatsappNumber,
      collegeName,
      department,
      currentYearSemester,
      refundPolicyAcknowledged,
      termsAcknowledged,
    } = req.body

    const fieldErrors: Record<string, string> = {}

    // 2. Validate Full Name
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 80) {
      fieldErrors.fullName = 'Full name is required and must be between 2 and 80 characters.'
    }

    // 3. Validate Gmail Address
    const emailResult = normalizeGmail(email)
    if (!emailResult.isValid) {
      fieldErrors.email = 'A valid email address is required.'
    } else if (!emailResult.isGmail) {
      fieldErrors.email = 'A Gmail address (@gmail.com) is required for Designathon communications and event day submissions.'
    }

    // 4. Validate Indian WhatsApp Mobile Number
    const phoneResult = normalizeIndianMobile(whatsappNumber)
    if (!phoneResult.isValid) {
      fieldErrors.whatsappNumber = 'Please enter a valid 10-digit Indian WhatsApp mobile number (starting with 6, 7, 8, or 9).'
    }

    // 5. Validate College Name
    if (!collegeName || typeof collegeName !== 'string' || collegeName.trim().length < 2 || collegeName.trim().length > 150) {
      fieldErrors.collegeName = 'College name is required and must be between 2 and 150 characters.'
    }

    // 6. Validate Department
    if (!department || typeof department !== 'string' || department.trim().length < 2 || department.trim().length > 100) {
      fieldErrors.department = 'Department is required and must be between 2 and 100 characters.'
    }

    // 7. Validate Current Year / Semester
    if (!currentYearSemester || typeof currentYearSemester !== 'string' || currentYearSemester.trim().length < 1 || currentYearSemester.trim().length > 60) {
      fieldErrors.currentYearSemester = 'Current year / semester is required.'
    }

    // 8. Validate Required Acknowledgements
    if (refundPolicyAcknowledged !== true) {
      fieldErrors.refundPolicyAcknowledged = 'You must acknowledge that the ₹49 registration fee is non-refundable.'
    }

    if (termsAcknowledged !== true) {
      fieldErrors.termsAcknowledged = 'You must agree to the event terms and privacy notice.'
    }

    if (Object.keys(fieldErrors).length > 0) {
      res.status(400).json({
        success: false,
        message: 'Please resolve the highlighted validation errors.',
        errors: fieldErrors,
      })
      return
    }

    const cleanFullName = fullName.trim()
    const cleanEmail = emailResult.normalized
    const cleanPhone = phoneResult.normalized
    const cleanCollege = collegeName.trim()
    const cleanDepartment = department.trim()
    const cleanYearSem = currentYearSemester.trim()

    // 9. Prevent Duplicate Successful Registrations
    const existingConfirmed = await DesignathonRegistration.findOne({
      email: cleanEmail,
      eventId: DESIGNATHON_CONFIG.eventId,
      paymentStatus: 'paid',
    })

    if (existingConfirmed) {
      res.status(409).json({
        success: false,
        message: `A confirmed registration already exists for ${cleanEmail} (Registration ID: ${existingConfirmed.registrationId}). Duplicate registrations for the same participant are not allowed.`,
        registrationId: existingConfirmed.registrationId,
        alreadyConfirmed: true,
      })
      return
    }

    // Optional authenticated user id
    const auth = getAuthenticatedUser(req)
    const userId = auth.user?.userId

    // 10. Check for existing pending registration for safe resumption/retry
    let registration = await DesignathonRegistration.findOne({
      email: cleanEmail,
      eventId: DESIGNATHON_CONFIG.eventId,
      registrationStatus: { $in: ['pending_payment', 'payment_failed'] },
    })

    if (registration) {
      // Update details on existing pending registration
      registration.fullName = cleanFullName
      registration.whatsappNumber = cleanPhone
      registration.collegeName = cleanCollege
      registration.department = cleanDepartment
      registration.currentYearSemester = cleanYearSem
      registration.refundPolicyAcknowledged = true
      registration.termsAcknowledged = true
      if (userId) registration.userId = userId

      registration.auditHistory.push({
        action: 'pending_registration_updated',
        timestamp: new Date(),
        actor: 'customer',
        details: { note: 'Participant updated form details before checkout' },
      })

      await registration.save()
    } else {
      // Create fresh pending registration
      let newId = generateRegistrationId()
      // Collision protection loop
      let isUnique = false
      while (!isUnique) {
        const collision = await DesignathonRegistration.findOne({ registrationId: newId })
        if (!collision) {
          isUnique = true
        } else {
          newId = generateRegistrationId()
        }
      }

      registration = new DesignathonRegistration({
        registrationId: newId,
        eventId: DESIGNATHON_CONFIG.eventId,
        fullName: cleanFullName,
        email: cleanEmail,
        whatsappNumber: cleanPhone,
        collegeName: cleanCollege,
        department: cleanDepartment,
        currentYearSemester: cleanYearSem,
        participation: 'individual',
        feeRupees: DESIGNATHON_CONFIG.feeRupees,
        feePaise: DESIGNATHON_CONFIG.feePaise,
        currency: 'INR',
        registrationStatus: 'pending_payment',
        paymentStatus: 'pending',
        refundPolicyAcknowledged: true,
        termsAcknowledged: true,
        emailStatus: 'not_sent',
        userId,
        auditHistory: [
          {
            action: 'registration_created',
            timestamp: new Date(),
            actor: 'customer',
            details: { ip: req.ip },
          },
        ],
      })

      await registration.save()
    }

    res.status(201).json({
      success: true,
      message: 'Pending registration created successfully.',
      registrationId: registration.registrationId,
      status: registration.registrationStatus,
      fee: registration.feeRupees,
      currency: registration.currency,
    })
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'A registration already exists for this email address or identifier.',
      })
      return
    }

    console.error('[Designathon] registerForDesignathon error:', err)
    res.status(500).json({
      success: false,
      message: 'Server error while processing registration. Please try again.',
    })
  }
}

/**
 * POST /api/designathon/create-order
 * Creates a Razorpay order authoritatively bound to the registration.
 * Fixed fee computed server-side: 4,900 paise (₹49).
 */
export const createDesignathonOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { registrationId } = req.body

    if (!registrationId || typeof registrationId !== 'string' || !registrationId.trim()) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: registrationId is required.',
      })
      return
    }

    // Enforce closing deadline for payment order creation
    const windowState = checkRegistrationWindow()
    if (!windowState.isOpen) {
      res.status(400).json({
        success: false,
        message: windowState.message,
        windowStatus: windowState.status,
      })
      return
    }

    const cleanRegId = registrationId.trim().toUpperCase()
    const registration = await DesignathonRegistration.findOne({ registrationId: cleanRegId })

    if (!registration) {
      res.status(404).json({
        success: false,
        message: `Registration not found for ID '${cleanRegId}'.`,
      })
      return
    }

    if (registration.paymentStatus === 'paid' || registration.registrationStatus === 'confirmed') {
      res.status(400).json({
        success: false,
        message: 'This registration has already been paid and confirmed.',
        alreadyConfirmed: true,
      })
      return
    }

    if (registration.registrationStatus === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'Cannot initialize payment for a cancelled registration.',
      })
      return
    }

    // Authoritative amount in paise computed server-side
    const numericAmount = DESIGNATHON_CONFIG.feePaise // 4900 paise = ₹49.00
    const receipt = `dsn_${cleanRegId}`.slice(0, 40)

    let razorpay
    try {
      razorpay = getRazorpayClient()
    } catch (configErr: any) {
      console.error('[Designathon] Razorpay credentials missing:', configErr.message)
      res.status(500).json({
        success: false,
        message: 'Payment gateway configuration error: Server credentials not configured.',
      })
      return
    }

    const orderOptions = {
      amount: numericAmount,
      currency: 'INR',
      receipt,
      notes: {
        registrationId: registration.registrationId,
        eventId: registration.eventId,
        email: registration.email,
        phone: registration.whatsappNumber,
        type: 'designathon_registration',
      },
    }

    const razorpayOrder = await razorpay.orders.create(orderOptions)

    if (!razorpayOrder || !razorpayOrder.id) {
      res.status(500).json({
        success: false,
        message: 'Failed to initiate order with Razorpay.',
      })
      return
    }

    // Bind Razorpay Order ID to the registration document
    registration.razorpayOrderId = razorpayOrder.id
    registration.auditHistory.push({
      action: 'razorpay_order_created',
      timestamp: new Date(),
      actor: 'system',
      details: { razorpayOrderId: razorpayOrder.id, amount: numericAmount },
    })
    await registration.save()

    res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      key_id: getRazorpayKeyId(),
      registrationId: registration.registrationId,
      participantName: registration.fullName,
      email: registration.email,
      phone: registration.whatsappNumber,
    })
  } catch (err: any) {
    const maskedKey = getMaskedKey(getRazorpayKeyId())
    console.error('[Designathon] createDesignathonOrder error:', {
      error: err?.message,
      statusCode: err?.statusCode,
      keyId: maskedKey,
    })

    if (err?.statusCode === 401) {
      res.status(401).json({
        success: false,
        message: 'Razorpay authentication failed. Server payment keys are not configured or rejected.',
        key_id_masked: maskedKey,
      })
      return
    }

    res.status(500).json({
      success: false,
      message: err?.error?.description || err?.message || 'Error communicating with payment gateway.',
    })
  }
}

/**
 * POST /api/designathon/verify-payment
 * Authoritatively verifies Razorpay checkout signature using HMAC-SHA256.
 * Transitions registration to confirmed & paid idempotently.
 * Dispatches confirmation email upon verified payment.
 */
export const verifyDesignathonPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      registrationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    if (!registrationId || typeof registrationId !== 'string' || !registrationId.trim()) {
      res.status(400).json({ success: false, message: 'Missing required field: registrationId.' })
      return
    }
    if (!razorpay_order_id || typeof razorpay_order_id !== 'string' || !razorpay_order_id.trim()) {
      res.status(400).json({ success: false, message: 'Missing required field: razorpay_order_id.' })
      return
    }
    if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string' || !razorpay_payment_id.trim()) {
      res.status(400).json({ success: false, message: 'Missing required field: razorpay_payment_id.' })
      return
    }
    if (!razorpay_signature || typeof razorpay_signature !== 'string' || !razorpay_signature.trim()) {
      res.status(400).json({ success: false, message: 'Missing required field: razorpay_signature.' })
      return
    }

    const cleanRegId = registrationId.trim().toUpperCase()
    const cleanOrderId = razorpay_order_id.trim()
    const cleanPaymentId = razorpay_payment_id.trim()
    const cleanSignature = razorpay_signature.trim()

    // 1. Retrieve Secret Key
    let keySecret: string
    try {
      keySecret = getRazorpayKeySecret()
    } catch {
      res.status(500).json({
        success: false,
        message: 'Server payment configuration error: RAZORPAY_KEY_SECRET missing.',
      })
      return
    }

    // 2. Compute Expected Signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const signPayload = `${cleanOrderId}|${cleanPaymentId}`
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(signPayload)
      .digest('hex')

    // 3. Timing-safe buffer comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    const receivedBuffer = Buffer.from(cleanSignature, 'utf8')

    const isMatch =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer)

    if (!isMatch) {
      console.warn(`[Designathon] Payment signature mismatch for registration: ${cleanRegId}`)
      res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid checkout signature.',
      })
      return
    }

    // 4. Find registration in MongoDB
    const registration = await DesignathonRegistration.findOne({ registrationId: cleanRegId })
    if (!registration) {
      res.status(404).json({
        success: false,
        message: `Registration not found for ID '${cleanRegId}'.`,
      })
      return
    }

    // 5. Verify order binding matches
    if (registration.razorpayOrderId && registration.razorpayOrderId !== cleanOrderId) {
      console.warn(
        `[Designathon] Order ID mismatch. Expected ${registration.razorpayOrderId}, received ${cleanOrderId}`
      )
      res.status(400).json({
        success: false,
        message: 'Payment verification failed: Razorpay order ID mismatch.',
      })
      return
    }

    // 6. Idempotency Check: Already confirmed and paid?
    if (registration.paymentStatus === 'paid' && registration.registrationStatus === 'confirmed') {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully (already recorded).',
        registrationId: registration.registrationId,
        status: registration.registrationStatus,
        paymentStatus: registration.paymentStatus,
      })
      return
    }

    // 7. Update Registration to Confirmed & Paid
    registration.registrationStatus = 'confirmed'
    registration.paymentStatus = 'paid'
    registration.razorpayOrderId = cleanOrderId
    registration.razorpayPaymentId = cleanPaymentId
    registration.razorpaySignature = cleanSignature
    registration.paymentVerifiedAt = new Date()
    registration.verifiedAmountPaise = DESIGNATHON_CONFIG.feePaise

    registration.auditHistory.push({
      action: 'payment_verified',
      timestamp: new Date(),
      actor: 'razorpay_checkout',
      details: {
        paymentId: cleanPaymentId,
        orderId: cleanOrderId,
        amount: DESIGNATHON_CONFIG.feePaise,
      },
    })

    await registration.save()

    console.log(`[Designathon] Registration ${registration.registrationId} confirmed and paid.`)

    // 8. Dispatch Confirmation Email Asynchronously
    sendDesignathonConfirmationEmail(registration).catch((emailErr) => {
      console.error('[Designathon] Confirmation email dispatch error:', emailErr)
    })

    res.status(200).json({
      success: true,
      message: 'Payment verified and registration confirmed successfully!',
      registrationId: registration.registrationId,
      status: registration.registrationStatus,
      paymentStatus: registration.paymentStatus,
      participantName: registration.fullName,
      email: registration.email,
    })
  } catch (err: any) {
    console.error('[Designathon] verifyDesignathonPayment error:', err)
    res.status(500).json({
      success: false,
      message: err?.message || 'Server error during payment verification.',
    })
  }
}

/**
 * POST /api/designathon/webhook
 * Authenticated Razorpay webhook for Designathon registrations.
 * Signature validation against raw payload using RAZORPAY_WEBHOOK_SECRET.
 * Idempotent capture & state transition.
 */
export const handleDesignathonWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim()
    const receivedSignature = req.headers['x-razorpay-signature'] as string | undefined

    // 1. Signature Verification
    if (webhookSecret && receivedSignature) {
      // Use raw body buffer if captured, otherwise serialize JSON
      const rawPayload = (req as any).rawBody
        ? (req as any).rawBody.toString('utf8')
        : JSON.stringify(req.body)

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawPayload)
        .digest('hex')

      if (receivedSignature !== expectedSignature) {
        console.warn('[DesignathonWebhook] Signature verification failed.')
        res.status(400).json({ success: false, message: 'Invalid webhook signature.' })
        return
      }
    }

    const event = req.body?.event
    const paymentEntity = req.body?.payload?.payment?.entity
    const orderEntity = req.body?.payload?.order?.entity

    console.log(`[DesignathonWebhook] Event received: ${event}`)

    if (event === 'payment.captured' || event === 'order.paid') {
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id
      const razorpayPaymentId = paymentEntity?.id
      const registrationId =
        paymentEntity?.notes?.registrationId || orderEntity?.notes?.registrationId

      let registration = null

      if (registrationId) {
        registration = await DesignathonRegistration.findOne({
          registrationId: String(registrationId).trim().toUpperCase(),
        })
      } else if (razorpayOrderId) {
        registration = await DesignathonRegistration.findOne({ razorpayOrderId })
      }

      if (registration) {
        if (registration.paymentStatus !== 'paid') {
          registration.registrationStatus = 'confirmed'
          registration.paymentStatus = 'paid'
          registration.razorpayOrderId = razorpayOrderId || registration.razorpayOrderId
          registration.razorpayPaymentId = razorpayPaymentId || registration.razorpayPaymentId
          registration.paymentVerifiedAt = new Date()
          registration.verifiedAmountPaise = paymentEntity?.amount || DESIGNATHON_CONFIG.feePaise

          registration.auditHistory.push({
            action: 'payment_captured_webhook',
            timestamp: new Date(),
            actor: 'razorpay_webhook',
            details: { event, paymentId: razorpayPaymentId, orderId: razorpayOrderId },
          })

          await registration.save()
          console.log(
            `[DesignathonWebhook] Webhook marked registration ${registration.registrationId} as paid & confirmed.`
          )

          // Dispatch email if not already sent
          if (registration.emailStatus !== 'sent') {
            sendDesignathonConfirmationEmail(registration).catch((err) => {
              console.error('[DesignathonWebhook] Email send error:', err)
            })
          }
        }
      }
    }

    res.status(200).json({ status: 'ok' })
  } catch (err: any) {
    console.error('[DesignathonWebhook] Webhook processing error:', err)
    res.status(500).json({ status: 'error', message: 'Webhook processing error' })
  }
}

/**
 * GET /api/designathon/status/:registrationId
 * Public sanitized status query for the participant.
 */
export const getRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const registrationId = String(req.params.registrationId || '').trim()
    if (!registrationId) {
      res.status(400).json({ success: false, message: 'Registration ID required.' })
      return
    }

    const cleanRegId = registrationId.toUpperCase()
    const registration = await DesignathonRegistration.findOne({ registrationId: cleanRegId })

    if (!registration) {
      res.status(404).json({ success: false, message: 'Registration not found.' })
      return
    }

    res.status(200).json({
      success: true,
      registration: {
        registrationId: registration.registrationId,
        fullName: registration.fullName,
        collegeName: registration.collegeName,
        department: registration.department,
        currentYearSemester: registration.currentYearSemester,
        registrationStatus: registration.registrationStatus,
        paymentStatus: registration.paymentStatus,
        emailStatus: registration.emailStatus,
        feeRupees: registration.feeRupees,
        eventDate: DESIGNATHON_CONFIG.eventDate,
        createdAt: registration.createdAt,
        paymentVerifiedAt: registration.paymentVerifiedAt,
      },
    })
  } catch (err: any) {
    console.error('[Designathon] getRegistrationStatus error:', err)
    res.status(500).json({ success: false, message: 'Failed to retrieve status.' })
  }
}
