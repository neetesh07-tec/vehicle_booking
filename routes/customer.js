import express from 'express';
import * as pool from '../config/db.js';
import { requireRole } from './middleware.js';

const router = express.Router();
router.use(requireRole('customer'));

router.get('/cars', async (req, res) => {
  const { q, fuel_type, seats, location, max_price } = req.query;
  const filters = ["status = 'available'"];
  const params = [];

  if (q) {
    filters.push('(brand LIKE ? OR model LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (fuel_type) {
    filters.push('fuel_type = ?');
    params.push(fuel_type);
  }
  if (seats) {
    filters.push('seats >= ?');
    params.push(seats);
  }
  if (location) {
    filters.push('location LIKE ?');
    params.push(`%${location}%`);
  }
  if (max_price) {
    filters.push('price_per_day <= ?');
    params.push(max_price);
  }

  const [cars] = await pool.execute(
    `SELECT * FROM cars WHERE ${filters.join(' AND ')} ORDER BY price_per_day ASC`,
    params
  );
  res.render('customer/cars', { cars, query: req.query });
});

router.get('/cars/:id/book', async (req, res) => {
  const [cars] = await pool.execute("SELECT * FROM cars WHERE id = ? AND status = 'available'", [req.params.id]);
  if (!cars[0]) return res.status(404).render('not-found');
  res.render('customer/book-car', { car: cars[0] });
});

router.post('/cars/:id/book', async (req, res) => {
  const { start_date, end_date, message } = req.body;
  if (new Date(start_date) > new Date(end_date)) {
    req.session.error = 'End date must be after start date.';
    return res.redirect(`/customer/cars/${req.params.id}/book`);
  }

  await pool.execute(
    'INSERT INTO bookings (user_id, car_id, start_date, end_date, message) VALUES (?, ?, ?, ?, ?)',
    [req.session.user.id, req.params.id, start_date, end_date, message]
  );
  req.session.success = 'Booking request sent.';
  res.redirect('/customer/bookings');
});

router.get('/bookings', async (req, res) => {
  const [bookings] = await pool.execute(
    `
      SELECT b.*, c.brand, c.model, c.price_per_day
      FROM bookings b
      JOIN cars c ON c.id = b.car_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `,
    [req.session.user.id]
  );
  res.render('customer/bookings', { bookings });
});

export default router;
