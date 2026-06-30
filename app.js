import express from 'express';
import session from 'express-session';
import methodOverride from 'method-override';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import customerRoutes from './routes/customer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.error = req.session.error || null;
  res.locals.success = req.session.success || null;
  res.locals.formatDate = (value) => {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
  };
  delete req.session.error;
  delete req.session.success;
  next();
});

app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role === 'admin') return res.redirect('/admin/cars');
  return res.redirect('/customer/cars');
});

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/customer', customerRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    message: getFriendlyError(err)
  });
});

app.use((req, res) => {
  res.status(404).render('not-found');
});

function getFriendlyError(err) {
  const code = err && (err.code || err.errno);
  const text = err ? String(err.message || err) : '';

  if (
    code === 'ECONNREFUSED' ||
    code === 'ER_BAD_DB_ERROR' ||
    code === 'ER_ACCESS_DENIED_ERROR' ||
    text.includes('ECONNREFUSED') ||
    text.includes('Access denied') ||
    text.includes('Unknown database')
  ) {
    return 'Database connection failed. Start PostgreSQL, create/import the car_booking database from postgres_schema.sql, and check your .env PostgreSQL credentials.';
  }

  if (code === 'ER_NO_SUCH_TABLE' || text.includes("doesn't exist")) {
    return 'Database tables are missing. Import postgres_schema.sql into PostgreSQL before using the app.';
  }

  return 'Something went wrong. Please check the server terminal for details.';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Car booking app running at http://localhost:${PORT}`);
});
