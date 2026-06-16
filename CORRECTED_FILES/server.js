// backend/server.js - VERSION CORRIGÉE ET COMPLÈTE
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const cronScheduler = require('./cronScheduler');
const db = require('./config/db');

const app = express();

// ✅ SECURITY: Helmet pour les headers HTTP
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// ✅ SECURITY: Rate limiting global (200 req/15min par IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limite chaque IP à 200 requêtes par 15 min
  message: { message: 'Trop de requêtes, veuillez réessayer dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', generalLimiter);

// ✅ SECURITY: Rate limiting spécifique pour l'authentification (anti-brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Max 100 tentatives par 15 min
  message: { message: 'Sécurité : Trop de tentatives.' },
  skipSuccessfulRequests: true,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/verify-reset-otp', authLimiter);

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ Logger middleware
app.use(require('./middleware/logger'));

// ✅ Servir les fichiers statiques (uploads, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/alertes', require('./routes/alertes'));
app.use('/api/tickets', require('./routes/tickets'));

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur Ooredoo actif', timestamp: new Date() });
});

// ✅ Initialiser les tâches planifiées
cronScheduler.init();

// ✅ ERREUR: Global error handler (404 + 500)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée', path: req.path });
});

app.use((err, req, res, next) => {
  console.error('❌ Erreur non gérée:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });
  res.status(500).json({
    message: 'Erreur interne du serveur',
    error: process.env.DEV_MODE === 'true' ? err.message : undefined,
  });
});

// ✅ HANDLE: Exceptions asynchrones non gérées
process.on('uncaughtException', (err) => {
  console.error('❌ Exception non capturée:', err.message);
  console.error(err.stack);
  // Ne pas quitter le processus (production)
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  console.error('Promise:', promise);
  // Ne pas quitter le processus (production)
});

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`✅ Connecté à PostgreSQL`);
  if (process.env.DEV_MODE === 'true') {
    console.log(`⚠️  MODE DEV ACTIVÉ - OTP affichés sur frontend`);
  }
});

// ✅ SHUTDOWN: Graceful shutdown
function gracefulShutdown() {
  console.log('\n🛑 Arrêt gracieux du serveur...');
  server.close(() => {
    console.log('✅ Serveur fermé');
    db.pool?.end?.();
    process.exit(0);
  });
  
  // Force quit après 10 secondes
  setTimeout(() => {
    console.error('⚠️  Forçage de l\'arrêt après 10 secondes');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
