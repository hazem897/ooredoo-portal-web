// backend/routes/alertes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifierToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const alerteController = require('../controllers/alerteController');

// ──────────────────────────────────────────────────────────────
// ROUTES ALERTES
// ──────────────────────────────────────────────────────────────

// GET /api/alertes - Retourne les catégories d'alertes
router.get('/', verifierToken, alerteController.getAlertes);

// POST /api/alertes/:id/relance - Envoi relance email
router.post('/:id/relance', verifierToken, alerteController.envoyerRelance);

// POST /api/alertes/relance-groupe - Relance groupée
router.post('/relance-groupe', verifierToken, alerteController.envoyerRelanceGroupe);

// PUT /api/alertes/:id/statut-gel - Mise à jour statut gel
router.put('/:id/statut-gel', verifierToken, alerteController.updateStatutGel);

module.exports = router;
