import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { findService } from '../services.js';
const router = Router();
const allowedSlots = new Set(['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM']);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const service = findService(String(req.body.serviceId || ''));
    const date = String(req.body.date || '');
    const slot = String(req.body.slot || '');
    const customerName = String(req.body.customerName || '').trim();
    const customerEmail = String(req.body.customerEmail || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').trim();
    const notes = String(req.body.notes || '').trim();
    if (!service) return res.status(400).json({ message: 'Please select a valid service.' });
    if (!datePattern.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00Z`))) return res.status(400).json({ message: 'Please select a valid date.' });
    const requested = new Date(`${date}T00:00:00Z`);
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const maxDate = new Date(today); maxDate.setUTCDate(maxDate.getUTCDate() + 180);
    if (requested < today || requested > maxDate) return res.status(400).json({ message: 'Choose a date within the next 180 days.' });
    if (!allowedSlots.has(slot)) return res.status(400).json({ message: 'Please choose one of the available time slots.' });
    if (customerName.length < 2 || customerName.length > 100) return res.status(400).json({ message: 'Enter a valid customer name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || customerEmail.length > 254) return res.status(400).json({ message: 'Enter a valid customer email.' });
    if (phone.length < 7 || phone.length > 25) return res.status(400).json({ message: 'Enter a valid phone number.' });
    if (notes.length > 500) return res.status(400).json({ message: 'Notes must be 500 characters or fewer.' });

    const reference = `FRM-${randomBytes(4).toString('hex').toUpperCase()}`;
    const result = await pool.query(
      `INSERT INTO bookings (user_id, reference, service_id, service_title, price, booking_date, time_slot, customer_name, customer_email, phone, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, reference, service_id, service_title, price, booking_date, time_slot, customer_name, customer_email, phone, notes, status, created_at`,
      [req.user.id, reference, service.id, service.title, service.price, date, slot, customerName, customerEmail, phone, notes || null]
    );
    const booking = result.rows[0];
    return res.status(201).json({ message: 'Booking confirmed.', booking });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'That service and time slot was just booked. Please choose another slot.' });
    next(error);
  }
});

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, reference, service_id, service_title, price, booking_date, time_slot, customer_name, customer_email, phone, notes, status, created_at
       FROM bookings WHERE user_id = $1 ORDER BY booking_date DESC, time_slot ASC`, [req.user.id]
    );
    res.json({ bookings: result.rows });
  } catch (error) { next(error); }
});
export default router;
