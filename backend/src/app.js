// backend/src/app.js
// Application Express — importée par le serveur local ET par Vercel

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Raw body pour les webhooks Stripe (AVANT express.json)
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/talents',       require('./routes/talents'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/boosts',        require('./routes/boosts'));
app.use('/api/cron',          require('./routes/cron'));
app.use('/api/webhooks',      require('./routes/webhooks'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() });
});

// 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route non trouvée : ${req.method} ${req.path}` });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, _next) => {
  console.error('[Error]', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erreur serveur' });
});

module.exports = app;
