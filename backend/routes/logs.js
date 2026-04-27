const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Récupérer tous les accès (historique des connexions/déconnexions)
router.get('/', (req, res) => {
  const query = `
    SELECT l.id, l.action, l.cree_le, u.nom, u.prenom, u.role, u.email
    FROM access_logs l
    JOIN users u ON l.user_id = u.id
    ORDER BY l.cree_le DESC
    LIMIT 500
  `;

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur SQL' });
    res.json(rows);
  });
});

// Récupérer l'historique d'un utilisateur spécifique
router.get('/user/:id', (req, res) => {
  const query = `
    SELECT id, action, cree_le
    FROM access_logs
    WHERE user_id = ?
    ORDER BY cree_le DESC
    LIMIT 20
  `;

  db.query(query, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur SQL' });
    res.json(rows);
  });
});

module.exports = router;
