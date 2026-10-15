import { Request, Response } from 'express'
import { FilterQuery } from 'mongoose'
import {
  DesignathonRegistration,
  IDesignathonRegistration,
} from '../models/DesignathonRegistration'
import {
  DesignathonSettings,
  getOrInitDesignathonSettings,
} from '../models/DesignathonSettings'
import { sendDesignathonConfirmationEmail } from '../services/designathonEmailService'

/**
 * GET /api/admin/designathon/registrations
 * Returns paginated registrations with search, status filters, date range, and overview metrics.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminDesignathonRegistrations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rawPage = parseInt(req.query.page as string, 10)
    const rawLimit = parseInt(req.query.limit as string, 10)
    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20
    const skip = (page - 1) * limit

    const searchQuery = typeof req.query.search === 'string' ? req.query.search.trim() : ''
    const regStatus = typeof req.query.registrationStatus === 'string' ? req.query.registrationStatus.trim() : ''
    const payStatus = typeof req.query.paymentStatus === 'string' ? req.query.paymentStatus.trim() : ''
    const emailStatus = typeof req.query.emailStatus === 'string' ? req.query.emailStatus.trim() : ''
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate.trim() : ''
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate.trim() : ''

    const filter: FilterQuery<IDesignathonRegistration> = {}

    // Search filter across name, registration ID, email, WhatsApp, college
    if (searchQuery) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      filter.$or = [
        { registrationId: regex },
        { fullName: regex },
        { email: regex },
        { whatsappNumber: regex },
        { collegeName: regex },
        { razorpayPaymentId: regex },
        { razorpayOrderId: regex },
      ]
    }

    if (regStatus && regStatus !== 'all') {
      filter.registrationStatus = regStatus
    }

    if (payStatus && payStatus !== 'all') {
      filter.paymentStatus = payStatus
    }

    if (emailStatus && emailStatus !== 'all') {
      filter.emailStatus = emailStatus
    }

    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        filter.createdAt.$lte = end
      }
    }

    // Execute queries in parallel
    const [total, registrations, metricsAgg] = await Promise.all([
      DesignathonRegistration.countDocuments(filter),
      DesignathonRegistration.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DesignathonRegistration.aggregate([
        {
          $group: {
            _id: null,
            totalEntries: { $sum: 1 },
            confirmedEntries: {
              $sum: { $cond: [{ $eq: ['$registrationStatus', 'confirmed'] }, 1, 0] },
            },
            paidEntries: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
            },
            pendingPaymentEntries: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] },
            },
            totalRevenue: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$feeRupees', 0] },
            },
          },
        },
      ]),
    ])

    const totalPages = Math.ceil(total / limit) || 1
    const metrics = metricsAgg[0] || {
      totalEntries: 0,
      confirmedEntries: 0,
      paidEntries: 0,
      pendingPaymentEntries: 0,
      totalRevenue: 0,
    }

    res.status(200).json({
      success: true,
      registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      metrics: {
        totalRegistrations: metrics.totalEntries,
        confirmedCount: metrics.confirmedEntries,
        paidCount: metrics.paidEntries,
        pendingPaymentCount: metrics.pendingPaymentEntries,
        verifiedRevenue: metrics.totalRevenue,
      },
    })
  } catch (err: any) {
    console.error('[AdminDesignathon] getAdminDesignathonRegistrations error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve Designathon registrations.',
    })
  }
}

/**
 * GET /api/admin/designathon/registrations/:registrationId
 * Returns full registration detail view including Razorpay references, email status, and complete audit history.
 */
export const getAdminDesignathonRegistrationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const registrationId = String(req.params.registrationId || '').trim()
    const cleanRegId = registrationId.toUpperCase()

    const registration = await DesignathonRegistration.findOne({ registrationId: cleanRegId })
    if (!registration) {
      res.status(404).json({
        success: false,
        message: `Registration not found for ID '${cleanRegId}'.`,
      })
      return
    }

    res.status(200).json({
      success: true,
      registration,
    })
  } catch (err: any) {
    console.error('[AdminDesignathon] getAdminDesignathonRegistrationById error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve registration details.',
    })
  }
}

/**
 * POST /api/admin/designathon/registrations/:registrationId/retry-email
 * Retries sending confirmation email for a confirmed/paid registration.
 */
export const retryAdminConfirmationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const registrationId = String(req.params.registrationId || '').trim()
    const cleanRegId = registrationId.toUpperCase()

    const registration = await DesignathonRegistration.findOne({ registrationId: cleanRegId })
    if (!registration) {
      res.status(404).json({
        success: false,
        message: `Registration not found for ID '${cleanRegId}'.`,
      })
      return
    }

    if (registration.paymentStatus !== 'paid' || registration.registrationStatus !== 'confirmed') {
      res.status(400).json({
        success: false,
        message: 'Confirmation emails can only be sent to paid and confirmed registrations.',
      })
      return
    }

    const adminEmail = (req as any).user?.email || 'admin'
    registration.auditHistory.push({
      action: 'email_retry_initiated_by_admin',
      timestamp: new Date(),
      actor: `admin:${adminEmail}`,
      details: { note: 'Admin triggered manual email retry' },
    })

    const dispatchResult = await sendDesignathonConfirmationEmail(registration)

    res.status(200).json({
      success: dispatchResult.success,
      emailStatus: registration.emailStatus,
      emailSentAt: registration.emailSentAt,
      emailFailureReason: registration.emailFailureReason,
      message: dispatchResult.success
        ? 'Confirmation email sent successfully.'
        : dispatchResult.pendingCredentials
          ? 'Email delivery could not be completed because SMTP provider credentials are not yet configured on the server.'
          : `Email delivery failed: ${dispatchResult.error}`,
    })
  } catch (err: any) {
    console.error('[AdminDesignathon] retryAdminConfirmationEmail error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to retry confirmation email.',
    })
  }
}

/**
 * Helper to escape CSV cell contents safely according to RFC 4180.
 */
function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""'
  const stringVal = String(val)
  // Escape inner double quotes by doubling them
  return `"${stringVal.replace(/"/g, '""')}"`
}

/**
 * GET /api/admin/designathon/export-csv
 * Exports registered participants to a secure CSV file with proper RFC 4180 escaping.
 */
export const exportAdminDesignathonCsv = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const registrations = await DesignathonRegistration.find()
      .sort({ createdAt: -1 })
      .lean()

    const headers = [
      'Registration ID',
      'Full Name',
      'Email',
      'WhatsApp Number',
      'College',
      'Department',
      'Year / Semester',
      'Registration Status',
      'Payment Status',
      'Razorpay Order ID',
      'Razorpay Payment ID',
      'Fee (INR)',
      'Payment Verified At',
      'Email Status',
      'Email Failure Details',
      'Created At',
    ]

    const rows = registrations.map((r) => [
      escapeCsvCell(r.registrationId),
      escapeCsvCell(r.fullName),
      escapeCsvCell(r.email),
      escapeCsvCell(r.whatsappNumber),
      escapeCsvCell(r.collegeName),
      escapeCsvCell(r.department),
      escapeCsvCell(r.currentYearSemester),
      escapeCsvCell(r.registrationStatus),
      escapeCsvCell(r.paymentStatus),
      escapeCsvCell(r.razorpayOrderId || ''),
      escapeCsvCell(r.razorpayPaymentId || ''),
      escapeCsvCell(r.feeRupees),
      escapeCsvCell(r.paymentVerifiedAt ? new Date(r.paymentVerifiedAt).toISOString() : ''),
      escapeCsvCell(r.emailStatus),
      escapeCsvCell(r.emailFailureReason || ''),
      escapeCsvCell(r.createdAt ? new Date(r.createdAt).toISOString() : ''),
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n')
    const filename = `kala-designathon-registrations-${Date.now()}.csv`

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.status(200).send(csvContent)
  } catch (err: any) {
    console.error('[AdminDesignathon] exportAdminDesignathonCsv error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSV export.',
    })
  }
}

/**
 * GET /api/admin/designathon/settings
 * Retrieves admin-managed dynamic settings for the event.
 */
export const getAdminDesignathonSettings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const settings = await getOrInitDesignathonSettings()
    res.status(200).json({
      success: true,
      settings,
    })
  } catch (err: any) {
    console.error('[AdminDesignathon] getAdminDesignathonSettings error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve event settings.',
    })
  }
}

/**
 * PATCH /api/admin/designathon/settings
 * Updates admin-managed dynamic settings (venue, format, judging criteria, submission instructions).
 */
export const updateAdminDesignathonSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      venue,
      eventFormat,
      judgingCriteria,
      submissionInstructions,
      participantLimit,
    } = req.body

    const settings = await getOrInitDesignathonSettings()

    if (venue !== undefined && typeof venue === 'string') {
      settings.venue = venue.trim()
    }
    if (eventFormat !== undefined && typeof eventFormat === 'string') {
      settings.eventFormat = eventFormat.trim()
    }
    if (judgingCriteria !== undefined && typeof judgingCriteria === 'string') {
      settings.judgingCriteria = judgingCriteria.trim()
    }
    if (submissionInstructions !== undefined && typeof submissionInstructions === 'string') {
      settings.submissionInstructions = submissionInstructions.trim()
    }
    if (participantLimit !== undefined) {
      const numLimit = Number(participantLimit)
      if (!isNaN(numLimit) && numLimit > 0) {
        settings.participantLimit = numLimit
      } else {
        settings.participantLimit = undefined
      }
    }

    const adminEmail = (req as any).user?.email || 'admin'
    settings.updatedBy = adminEmail
    await settings.save()

    res.status(200).json({
      success: true,
      message: 'Designathon settings updated successfully.',
      settings,
    })
  } catch (err: any) {
    console.error('[AdminDesignathon] updateAdminDesignathonSettings error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to update event settings.',
    })
  }
}
