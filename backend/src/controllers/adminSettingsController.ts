import { Request, Response } from 'express'
import { PlatformSettings } from '../models/PlatformSettings'
import { Payout } from '../models/Payout'
import { Transaction } from '../models/Transaction'

/**
 * GET /api/admin/settings
 * Retrieves platform configuration (commission rate, payouts, maintenance).
 */
export const getPlatformSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await PlatformSettings.findOne({ key: 'default_settings' })
    if (!settings) {
      settings = await PlatformSettings.create({
        key: 'default_settings',
        commissionRate: 5,
        payoutMinimumAmount: 500,
        payoutProcessingDays: 7,
      })
    }

    res.status(200).json({
      success: true,
      settings,
    })
  } catch (error: any) {
    console.error('[adminSettingsController] getPlatformSettings error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving settings.' })
  }
}

/**
 * PATCH /api/admin/settings/commission
 * Updates the platform commission rate.
 */
export const updateCommissionRate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commissionRate } = req.body
    const numericRate = Number(commissionRate)

    if (isNaN(numericRate) || numericRate < 0 || numericRate > 100) {
      res.status(400).json({
        success: false,
        message: 'Commission rate must be a percentage between 0 and 100.',
      })
      return
    }

    let settings = await PlatformSettings.findOne({ key: 'default_settings' })
    if (!settings) {
      settings = new PlatformSettings({ key: 'default_settings' })
    }

    settings.commissionRate = numericRate
    settings.updatedBy = req.user?.email
    await settings.save()

    res.status(200).json({
      success: true,
      message: `KALA marketplace platform commission updated to ${numericRate}%.`,
      settings,
    })
  } catch (error: any) {
    console.error('[adminSettingsController] updateCommissionRate error:', error)
    res.status(500).json({ success: false, message: 'Server error updating commission.' })
  }
}

/**
 * GET /api/admin/payouts
 * Retrieves all vendor payout requests for admin processing.
 */
export const getAllPayouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query
    const filter: any = {}
    if (status && typeof status === 'string' && status !== 'ALL') {
      filter.status = status.toUpperCase()
    }

    const payouts = await Payout.find(filter).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      payouts,
      count: payouts.length,
    })
  } catch (error: any) {
    console.error('[adminSettingsController] getAllPayouts error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving payouts.' })
  }
}

/**
 * PATCH /api/admin/payouts/:id/status
 * Updates payout status (PROCESSING, PAID, or REJECTED) with reference number and admin notes.
 */
export const updatePayoutStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const id = String(rawId || '').trim()
    const { status, referenceNumber, notes } = req.body

    const payout = await Payout.findOne({
      $or: [{ payoutId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    })

    if (!payout) {
      res.status(404).json({ success: false, message: 'Payout request not found.' })
      return
    }

    const normalizedStatus = String(status || '').toUpperCase()
    if (!['PENDING', 'PROCESSING', 'PAID', 'REJECTED'].includes(normalizedStatus)) {
      res.status(400).json({ success: false, message: 'Invalid payout status.' })
      return
    }

    payout.status = normalizedStatus as any
    if (referenceNumber) payout.referenceNumber = String(referenceNumber).trim()
    if (notes) payout.adminNotes = String(notes).trim()
    if (normalizedStatus === 'PAID') {
      payout.processedAt = new Date()
      payout.processedBy = req.user?.email
    }
    await payout.save()

    // If rejected, create an ADJUSTMENT transaction returning balance
    if (normalizedStatus === 'REJECTED') {
      await Transaction.create({
        transactionId: `TXN-REF-${Date.now()}`,
        vendorId: payout.vendorId,
        payoutId: payout.payoutId,
        type: 'ADJUSTMENT',
        amount: payout.amount,
        balanceAfter: payout.amount,
        description: `Refunded rejected payout ${payout.payoutId}: ${notes || 'Rejected by administrator'}`,
      }).catch(() => {})
    }

    res.status(200).json({
      success: true,
      message: `Payout ${payout.payoutId} marked as ${normalizedStatus}.`,
      payout,
    })
  } catch (error: any) {
    console.error('[adminSettingsController] updatePayoutStatus error:', error)
    res.status(500).json({ success: false, message: 'Server error updating payout status.' })
  }
}
