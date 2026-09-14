import express from 'express';
import { MeetingService } from '../models/Meeting.js';
import { EmailService } from '../services/emailService.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const STANDARD_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM'
];

// GET /api/meetings/slots - available time slots for a given date
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD).' });
    }

    const bookedTimes = await MeetingService.getBookedSlotsForDate(date);
    const slots = STANDARD_SLOTS.map(time => ({
      time,
      isAvailable: !bookedTimes.includes(time)
    }));

    return res.json({ date, slots, bookedTimes });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/meetings - customer books a meeting
router.post('/', async (req, res) => {
  try {
    const { customerName, customerEmail, phone, companyName, purpose, date, time, message } = req.body;

    if (!customerName || !customerEmail || !phone || !purpose || !date || !time) {
      return res.status(400).json({
        error: 'Please fill in all required fields: Name, Email, Phone, Purpose, Date, and Time.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Validate date is not in the past
    const selectedDate = new Date(`${date}T23:59:59`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ error: 'Meeting date cannot be in the past.' });
    }

    // Create meeting in database with status PENDING
    const newMeeting = await MeetingService.create({
      customerName,
      customerEmail,
      phone,
      companyName: companyName || '',
      purpose,
      date,
      time,
      message: message || ''
    });

    // Send async emails
    EmailService.sendAdminNewMeetingAlert(newMeeting).catch(err =>
      console.error('[Email Error] Admin alert failed:', err.message)
    );
    EmailService.sendCustomerPendingReceipt(newMeeting).catch(err =>
      console.error('[Email Error] Customer receipt failed:', err.message)
    );

    return res.status(201).json({
      message: 'Meeting request submitted successfully. Status is PENDING review.',
      meeting: newMeeting
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// GET /api/meetings - Admin lists all meetings
router.get('/', requireAdmin, async (req, res) => {
  try {
    const meetings = await MeetingService.getAll(req.query);
    return res.json({ count: meetings.length, meetings });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/meetings/:id/status - Admin confirms, cancels, or completes meeting
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const updated = await MeetingService.updateStatus(req.params.id, status, adminNotes);
    if (!updated) {
      return res.status(404).json({ error: 'Meeting not found.' });
    }

    // Trigger emails based on status change
    if (status === 'CONFIRMED') {
      EmailService.sendCustomerMeetingConfirmed(updated).catch(err =>
        console.error('[Email Error] Customer confirmation failed:', err.message)
      );
    } else if (status === 'CANCELLED') {
      EmailService.sendCustomerMeetingCancelled(updated).catch(err =>
        console.error('[Email Error] Customer cancellation failed:', err.message)
      );
    }

    return res.json({
      message: `Meeting status updated to ${status}. Notification dispatched.`,
      meeting: updated
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
