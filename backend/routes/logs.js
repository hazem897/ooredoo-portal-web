const express = require('express');
const router = express.Router();
const db = require('../config/db');

const logController = require('../controllers/logController');

// ──────────────────────────────────────────
// ROUTES LOGS (JOURNALISATION)
// ──────────────────────────────────────────

// Récupérer tous les accès
router.get('/', logController.getAllLogs);

// Récupérer l'historique d'un utilisateur spécifique
router.get('/user/:id', logController.getUserLogs);

module.exports = router;
