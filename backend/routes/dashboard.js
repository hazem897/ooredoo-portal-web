// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifierToken } = require('../middleware/auth');

// Helper: promisify db.query for async/await
function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const dashboardController = require('../controllers/dashboardController');

// ──────────────────────────────────────────
// ROUTES DASHBOARD
// ──────────────────────────────────────────

// GET /api/dashboard/stats - Statistiques
router.get('/stats', verifierToken, dashboardController.getStats);

// GET /api/dashboard/tickets - Liste des tickets filtrés
router.get('/tickets', verifierToken, dashboardController.getTickets);

module.exports = router;
