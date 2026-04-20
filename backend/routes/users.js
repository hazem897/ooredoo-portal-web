// backend/routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifierToken, verifierRole } = require('../middleware/auth');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Config Multer pour les photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/profiles';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });


// ──────────────────────────────────────────
// GET /api/users - Liste tous les utilisateurs
// Accès : admin seulement
// ──────────────────────────────────────────
router.get('/', verifierToken, verifierRole('admin'), (req, res) => {
  db.query(
    'SELECT id, nom, prenom, email, role, zone, statut, photo_url, cree_le FROM users ORDER BY cree_le DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur' });
      res.json(rows);
    }
  );
});

// ──────────────────────────────────────────
// PUT /api/users/:id/approuver
// Admin approuve ou refuse une inscription
// ──────────────────────────────────────────
router.put('/:id/approuver', verifierToken, verifierRole('admin'), (req, res) => {
  const { statut } = req.body; // 'approuve', 'refuse' ou 'suspendu'
  if (!['approuve', 'refuse', 'suspendu'].includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }

  // 1. Chercher les infos du user avant l'update
  db.query('SELECT nom, prenom, email FROM users WHERE id = ?', [req.params.id], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ message: 'User non trouvé' });
    const user = rows[0];

    // 2. Faire l'update
    db.query('UPDATE users SET statut = ? WHERE id = ?', [statut, req.params.id], (updErr) => {
      if (updErr) return res.status(500).json({ message: 'Erreur serveur' });
      
      // 3. Envoyer l'email en arrière-plan
      emailService.sendStatusEmail(user.email, user.nom, user.prenom, statut);
      
      res.json({ message: `Utilisateur ${statut}` });
    });
  });
});

// ──────────────────────────────────────────
// DELETE /api/users/:id - Supprimer un user
// Accès : admin seulement
// ──────────────────────────────────────────
router.delete('/:id', verifierToken, verifierRole('admin'), (req, res) => {
  // 1. Chercher les infos avant suppression
  db.query('SELECT nom, prenom, email FROM users WHERE id = ?', [req.params.id], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ message: 'User non trouvé' });
    const user = rows[0];

    // 2. Supprimer
    db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id], (delErr) => {
      if (delErr) return res.status(500).json({ message: 'Erreur serveur' });
      
      // 3. Envoyer email de notification de suppression
      emailService.sendStatusEmail(user.email, user.nom, user.prenom, 'supprime');

      res.json({ message: 'Utilisateur supprimé et notifié par email' });
    });
  });
});

// ──────────────────────────────────────────
// GET /api/users/:id - Avoir le profil d'un utilisateur
// ──────────────────────────────────────────
router.get('/:id', verifierToken, (req, res) => {
  // Vérifier que l'utilisateur est admin ou qu'il demande son propre profil
  if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé. Vous ne pouvez voir que votre profil.' });
  }

  db.query(
    'SELECT id, nom, prenom, email, role, zone, statut, photo_url, cree_le FROM users WHERE id = ?',
    [req.params.id],
    (err, rows) => {
      if (err || rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      res.json(rows[0]);
    }
  );
});

// ──────────────────────────────────────────
// PUT /api/users/:id - Modifier infos profil
// ──────────────────────────────────────────
router.put('/:id', verifierToken, (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  const { nom, prenom, email } = req.body;
  db.query(
    'UPDATE users SET nom = ?, prenom = ?, email = ? WHERE id = ?',
    [nom, prenom, email, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Erreur SQL' });
      res.json({ message: 'Profil mis à jour' });
    }
  );
});

// ──────────────────────────────────────────
// PUT /api/users/:id/password - Changer mdp
// ──────────────────────────────────────────
router.put('/:id/password', verifierToken, async (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  const { password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  
  db.query('UPDATE users SET mot_de_passe = ? WHERE id = ?', [hash, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur SQL' });
    res.json({ message: 'Mot de passe modifié' });
  });
});

// ──────────────────────────────────────────
// POST /api/users/:id/photo - Upload photo
// ──────────────────────────────────────────
router.post('/:id/photo', verifierToken, upload.single('photo'), (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

  const photoUrl = `/uploads/profiles/${req.file.filename}`;
  db.query('UPDATE users SET photo_url = ? WHERE id = ?', [photoUrl, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur SQL' });
    res.json({ photoUrl, message: 'Photo mise à jour' });
  });
});

module.exports = router;
