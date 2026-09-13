import express from 'express';
import { ContactService } from '../models/ContactRequest.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/contact - submit inquiry
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, channel } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const created = await ContactService.create({
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      channel: channel || 'Website Form'
    });

    return res.status(201).json({
      message: 'Your message has been sent to KALA Studio. We will contact you soon.',
      contact: created
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// GET /api/contact - Admin list inquiries
router.get('/', requireAdmin, async (_req, res) => {
  try {
    const contacts = await ContactService.getAll();
    return res.json({ count: contacts.length, contacts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
