import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { existsSync, unlinkSync, mkdirSync } from 'fs';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 3001) : 3004;
const JWT_SECRET = 'loft-secret-key-change-in-production';

// Ensure uploads directory
const uploadsDir = join(ROOT, 'public', 'uploads');
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    if (allowed.test(extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype.split('/')[1])) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(ROOT, 'dist')));
}

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Helper to delete old image
function deleteImage(filename) {
  if (!filename) return;
  const filepath = join(uploadsDir, filename);
  if (existsSync(filepath)) unlinkSync(filepath);
}

// ==================== AUTH ====================
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, username: admin.username });
});

app.post('/api/auth/change-password', auth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = db.prepare('SELECT * FROM admin WHERE id = ?').get(req.admin.id);
  if (!bcrypt.compareSync(currentPassword, admin.password)) {
    return res.status(400).json({ error: 'Wrong current password' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admin SET password = ? WHERE id = ?').run(hash, req.admin.id);
  res.json({ success: true });
});

// ==================== CATEGORIES (public) ====================
app.get('/api/categories', (req, res) => {
  const cats = db.prepare('SELECT * FROM categories ORDER BY sort_order, id').all();
  res.json(cats);
});

app.get('/api/categories/:id', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  res.json(cat);
});

// ==================== CATEGORIES (admin) ====================
app.post('/api/categories', auth, upload.single('image'), (req, res) => {
  const { name, name_ru, sort_order } = req.body;
  const image = req.file ? req.file.filename : null;
  const result = db.prepare('INSERT INTO categories (name, name_ru, image, sort_order) VALUES (?, ?, ?, ?)').run(name, name_ru || null, image, sort_order || 0);
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/categories/:id', auth, upload.single('image'), (req, res) => {
  const { name, name_ru, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  let image = existing.image;
  if (req.file) {
    deleteImage(existing.image);
    image = req.file.filename;
  }
  db.prepare('UPDATE categories SET name = ?, name_ru = ?, image = ?, sort_order = ? WHERE id = ?')
    .run(name, name_ru || null, image, sort_order || 0, req.params.id);
  res.json({ success: true });
});

app.delete('/api/categories/:id', auth, (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  deleteImage(cat.image);
  // Delete item images too
  const items = db.prepare('SELECT image FROM menu_items WHERE category_id = ?').all(req.params.id);
  items.forEach(i => deleteImage(i.image));
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== MENU ITEMS (public) ====================
app.get('/api/items', (req, res) => {
  const { category_id } = req.query;
  let items;
  if (category_id) {
    items = db.prepare('SELECT * FROM menu_items WHERE category_id = ? ORDER BY sort_order, id').all(category_id);
  } else {
    items = db.prepare('SELECT * FROM menu_items ORDER BY sort_order, id').all();
  }
  res.json(items);
});

// ==================== MENU ITEMS (admin) ====================
app.post('/api/items', auth, upload.single('image'), (req, res) => {
  const { category_id, name, name_ru, description, description_ru, price, weight, available, sort_order } = req.body;
  const image = req.file ? req.file.filename : null;
  const result = db.prepare(
    'INSERT INTO menu_items (category_id, name, name_ru, description, description_ru, price, weight, image, available, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(category_id, name, name_ru || null, description || null, description_ru || null, price, weight || null, image, available !== undefined ? available : 1, sort_order || 0);
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/items/:id', auth, upload.single('image'), (req, res) => {
  const { category_id, name, name_ru, description, description_ru, price, weight, available, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  let image = existing.image;
  if (req.file) {
    deleteImage(existing.image);
    image = req.file.filename;
  }
  db.prepare(
    'UPDATE menu_items SET category_id = ?, name = ?, name_ru = ?, description = ?, description_ru = ?, price = ?, weight = ?, image = ?, available = ?, sort_order = ? WHERE id = ?'
  ).run(category_id, name, name_ru || null, description || null, description_ru || null, price, weight || null, image, available !== undefined ? available : 1, sort_order || 0, req.params.id);
  res.json({ success: true });
});

app.delete('/api/items/:id', auth, (req, res) => {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  deleteImage(item.image);
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== FEEDBACK ====================
app.post('/api/feedback', (req, res) => {
  const { name, phone, email, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: 'Name and message required' });
  db.prepare('INSERT INTO feedback (name, phone, email, message) VALUES (?, ?, ?, ?)')
    .run(name, phone || null, email || null, message);
  res.json({ success: true });
});

app.get('/api/feedback', auth, (req, res) => {
  const items = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all();
  res.json(items);
});

app.put('/api/feedback/:id/read', auth, (req, res) => {
  db.prepare('UPDATE feedback SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.delete('/api/feedback/:id', auth, (req, res) => {
  db.prepare('DELETE FROM feedback WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== BOOKINGS ====================
app.post('/api/bookings', (req, res) => {
  const { name, phone, date, guests, eventType, hall, message } = req.body;
  if (!name || !phone || !date) return res.status(400).json({ error: 'Name, phone and date required' });
  db.prepare('INSERT INTO bookings (name, phone, date, guests, event_type, hall, message) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(name, phone, date, guests || null, eventType || null, hall || null, message || null);
  res.json({ success: true });
});

app.get('/api/bookings', auth, (req, res) => {
  const items = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
  res.json(items);
});

app.put('/api/bookings/:id/status', auth, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

app.delete('/api/bookings/:id', auth, (req, res) => {
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== STATS ====================
app.get('/api/stats', auth, (req, res) => {
  const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  const items = db.prepare('SELECT COUNT(*) as count FROM menu_items').get().count;
  const feedback = db.prepare('SELECT COUNT(*) as count FROM feedback').get().count;
  const unread = db.prepare('SELECT COUNT(*) as count FROM feedback WHERE is_read = 0').get().count;
  const bookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
  const newBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'new'").get().count;
  res.json({ categories, items, feedback, unread, bookings, newBookings });
});

// SPA fallback in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(ROOT, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
