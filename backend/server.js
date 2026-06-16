// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cronScheduler = require('./cronScheduler');
const db = require('./config/db');

const app = express();

// A02: Security Misconfiguration - Protection des en-têtes HTTP
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // On désactive temporairement pour test mobile
}));


// A06: Insecure Design - Rate Limiting Global
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limite chaque IP à 200 requêtes par 15 min
  message: { message: 'Trop de requêtes, veuillez réessayer dans 15 minutes.' }
});
app.use('/api', generalLimiter);

// A06: Rate Limiting spécifique pour l'authentification (Antibrute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Réduit à 15 min
  max: 100, // Augmenté à 100 pour éviter les blocages tunnel
  message: { message: 'Sécurité : Trop de tentatives.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/verify-reset-otp', authLimiter);

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logger d'activités (actions des utilisateurs)
app.use(require('./middleware/logger'));

// Servir les photos de profil
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/alertes', require('./routes/alertes'));
app.use('/api/tickets', require('./routes/tickets'));

// Initialisation des tâches planifiées (Cron)
cronScheduler.init();

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur Ooredoo actif', timestamp: new Date() });
});

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

// ⚠️ VALIDATION: Vérifier les variables d'environnement critiques
if (!process.env.JWT_SECRET) {
  console.error('❌ ERREUR CRITIQUE: JWT_SECRET non défini dans .env');
  process.exit(1);
}

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error('❌ ERREUR CRITIQUE: Configuration base de données incomplète');
  process.exit(1);
}

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
