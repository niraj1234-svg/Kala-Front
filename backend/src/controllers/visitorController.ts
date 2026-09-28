import { Request, Response } from 'express'
import { Visitor } from '../models/Visitor'
import { sendFirstVisitAlert } from '../services/notificationService'

/**
 * POST /api/visitors/first-visit
 * Records an anonymous first-time visitor and dispatches an admin alert if genuinely new.
 */
export const recordFirstVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      visitorId,
      device,
      browser,
      os,
      referrer,
      location,
      userAgent,
    } = req.body

    if (!visitorId || typeof visitorId !== 'string' || !visitorId.trim()) {
      res.status(400).json({
        success: false,
        message: 'A valid anonymous visitorId is required.',
      })
      return
    }

    const cleanVisitorId = visitorId.trim()

    // 1. Check if visitor is already recorded
    const existing = await Visitor.findOne({ visitorId: cleanVisitorId })

    if (existing) {
      existing.lastSeenAt = new Date()
      await existing.save()

      res.status(200).json({
        success: true,
        isNew: false,
        message: 'Returning visitor recognized.',
      })
      return
    }

    // 2. Safe client IP extraction
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      ''

    const now = new Date()

    // 3. Create Visitor document in MongoDB
    const newVisitor = await Visitor.create({
      visitorId: cleanVisitorId,
      firstSeenAt: now,
      lastSeenAt: now,
      userAgent: (userAgent || req.headers['user-agent'] || '').slice(0, 300),
      device: typeof device === 'string' && device.trim() ? device.trim().slice(0, 50) : 'Desktop',
      browser: typeof browser === 'string' && browser.trim() ? browser.trim().slice(0, 50) : 'Unknown',
      os: typeof os === 'string' && os.trim() ? os.trim().slice(0, 50) : 'Unknown',
      ip: rawIp.slice(0, 45),
      referrer: typeof referrer === 'string' && referrer.trim() ? referrer.trim().slice(0, 200) : '',
      location: typeof location === 'string' && location.trim() ? location.trim().slice(0, 100) : '',
      emailSent: true,
      emailSentAt: now,
    })

    // 4. Dispatch Admin Notification via email
    sendFirstVisitAlert({
      visitorId: newVisitor.visitorId,
      timestamp: now,
      device: newVisitor.device || 'Desktop',
      browser: newVisitor.browser || 'Unknown',
      os: newVisitor.os || 'Unknown',
      referrer: newVisitor.referrer,
      location: newVisitor.location,
      ip: newVisitor.ip,
    }).catch((emailErr) => {
      console.error('[VisitorController] Failed to send first visit alert:', emailErr)
    })

    res.status(201).json({
      success: true,
      isNew: true,
      message: 'First visit recorded successfully.',
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error'
    console.error('[VisitorController] recordFirstVisit error:', msg)
    res.status(500).json({
      success: false,
      message: 'Server error processing visitor record.',
    })
  }
}
