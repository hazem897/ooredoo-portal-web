const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifierToken, verifierRole } = require('../middleware/auth');

const logController = require('../controllers/logController');

// ──────────────────────────────────────────
// ROUTES LOGS (JOURNALISATION)
// ──────────────────────────────────────────

// Récupérer tous les accès (Admin uniquement)
router.get('/', verifierToken, verifierRole('admin'), logController.getAllLogs);

// Récupérer l'historique d'un utilisateur spécifique (Admin ou lui-même)
router.get('/user/:id', verifierToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === Number(req.params.id)) {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé' });
  }
}, logController.getUserLogs);

module.exports = router;
