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
app.use(helmet());

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

// Middleware
app.use(cors());
app.use(express.json());

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

// Route de test
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Serveur Ooredoo actif' }));

// Gestion globale des erreurs (évite le crash du serveur)
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err.message);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// Capture des erreurs asynchrones non gérées (évite le crash)
process.on('uncaughtException', (err) => {
  console.error('❌ Exception non capturée:', err.message);
  // Ne pas quitter le processus
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  // Ne pas quitter le processus
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  // Log du démarrage
  db.query('INSERT INTO access_logs (user_id, action) VALUES (1, "login")');
});

// LOG ARRÊT DU SERVEUR
function logStopAndExit() {
  console.log('🛑 Arrêt du serveur...');
  db.query('INSERT INTO access_logs (user_id, action) VALUES (1, "logout")', () => {
    process.exit(0);
  });
  // Sécurité si la DB ne répond pas
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGINT', logStopAndExit);
process.on('SIGTERM', logStopAndExit);
