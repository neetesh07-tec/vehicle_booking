import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pool from '../config/db.js';
import { requireRole } from './middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.use(requireRole('admin'));

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'cars');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed.'));
    cb(null, true);
  }
});

function deleteUploadedImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/cars/')) return;
  const imagePath = path.join(__dirname, '..', 'public', imageUrl);
  fs.unlink(imagePath, () => {});
}

router.get('/cars', async (req, res) => {
  const { q, fuel_type, status, location } = req.query;
  const filters = [];
  const params = [];

  if (q) {
    filters.push('(brand LIKE ? OR model LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (fuel_type) {
    filters.push('fuel_type = ?');
    params.push(fuel_type);
  }
  if (status) {
    filters.push('status = ?');
    params.push(status);
  }
  if (location) {
    filters.push('location LIKE ?');
    params.push(`%${location}%`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const [cars] = await pool.execute(`SELECT * FROM cars ${where} ORDER BY created_at DESC`, params);
  res.render('admin/cars', { cars, query: req.query });
});

router.get('/cars/new', (req, res) => {
  res.render('admin/car-form', { car: null });
});

router.post('/cars', upload.single('image'), async (req, res) => {
  const { brand, model, year, price_per_day, fuel_type, seats, location, status, description } = req.body;
  const imageUrl = req.file ? `/uploads/cars/${req.file.filename}` : null;
  await pool.execute(
    'INSERT INTO cars (brand, model, year, price_per_day, fuel_type, seats, location, status, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [brand, model, year, price_per_day, fuel_type, seats, location, status, description, imageUrl]
  );
  req.session.success = 'Car added.';
  res.redirect('/admin/cars');
});

router.get('/cars/:id/edit', async (req, res) => {
  const [cars] = await pool.execute('SELECT * FROM cars WHERE id = ?', [req.params.id]);
  if (!cars[0]) return res.status(404).render('not-found');
  res.render('admin/car-form', { car: cars[0] });
});

router.put('/cars/:id', upload.single('image'), async (req, res) => {
  const { brand, model, year, price_per_day, fuel_type, seats, location, status, description } = req.body;
  const [cars] = await pool.execute('SELECT image_url FROM cars WHERE id = ?', [req.params.id]);
  if (!cars[0]) return res.status(404).render('not-found');
  const imageUrl = req.file ? `/uploads/cars/${req.file.filename}` : cars[0].image_url;

  await pool.execute(
    'UPDATE cars SET brand = ?, model = ?, year = ?, price_per_day = ?, fuel_type = ?, seats = ?, location = ?, status = ?, description = ?, image_url = ? WHERE id = ?',
    [brand, model, year, price_per_day, fuel_type, seats, location, status, description, imageUrl, req.params.id]
  );
  if (req.file) deleteUploadedImage(cars[0].image_url);
  req.session.success = 'Car updated.';
  res.redirect('/admin/cars');
});

router.delete('/cars/:id', async (req, res) => {
  const [cars] = await pool.execute('SELECT image_url FROM cars WHERE id = ?', [req.params.id]);
  await pool.execute('DELETE FROM cars WHERE id = ?', [req.params.id]);
  if (cars[0]) deleteUploadedImage(cars[0].image_url);
  req.session.success = 'Car deleted.';
  res.redirect('/admin/cars');
});

router.get('/bookings', async (req, res) => {
  const [bookings] = await pool.execute(`
    SELECT b.*, u.name AS customer_name, u.email, c.brand, c.model
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    JOIN cars c ON c.id = b.car_id
    ORDER BY b.created_at DESC
  `);
  res.render('admin/bookings', { bookings });
});

router.post('/bookings/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    req.session.error = 'Invalid booking status.';
    return res.redirect('/admin/bookings');
  }
  await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
  req.session.success = `Booking ${status}.`;
  res.redirect('/admin/bookings');
});

export default router;