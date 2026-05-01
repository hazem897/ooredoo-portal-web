// backend/controllers/userController.js
const db = require('../config/db');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');

exports.getAllUsers = (req, res) => {
  db.query(
    'SELECT id, nom, prenom, email, role, zone, statut, photo_url, cree_le FROM users ORDER BY cree_le DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur' });
      res.json(rows);
    }
  );
};

exports.approuverUser = (req, res) => {
  const { statut } = req.body; // 'approuve', 'refuse' ou 'suspendu'
  if (!['approuve', 'refuse', 'suspendu'].includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }

  db.query('SELECT nom, prenom, email FROM users WHERE id = ?', [req.params.id], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ message: 'User non trouvé' });
    const user = rows[0];

    db.query('UPDATE users SET statut = ? WHERE id = ?', [statut, req.params.id], (updErr) => {
      if (updErr) return res.status(500).json({ message: 'Erreur serveur' });
      emailService.sendStatusEmail(user.email, user.nom, user.prenom, statut);
      res.json({ message: `Utilisateur ${statut}` });
    });
  });
};

exports.supprimerUser = (req, res) => {
  db.query('SELECT nom, prenom, email FROM users WHERE id = ?', [req.params.id], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ message: 'User non trouvé' });
    const user = rows[0];

    db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id], (delErr) => {
      if (delErr) return res.status(500).json({ message: 'Erreur serveur' });
      emailService.sendStatusEmail(user.email, user.nom, user.prenom, 'supprime');
      res.json({ message: 'Utilisateur supprimé et notifié par email' });
    });
  });
};

exports.getProfil = (req, res) => {
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
};

exports.modifierProfil = (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  const { nom, prenom, email, zone } = req.body;
  db.query(
    'UPDATE users SET nom = ?, prenom = ?, email = ?, zone = ? WHERE id = ?',
    [nom, prenom, email, zone, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Erreur SQL' });
      res.json({ message: 'Profil mis à jour' });
    }
  );
};

exports.changerMotDePasse = async (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  const { password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  
  db.query('UPDATE users SET mot_de_passe = ? WHERE id = ?', [hash, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur SQL' });
    res.json({ message: 'Mot de passe modifié' });
  });
};

exports.uploadPhoto = (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

  const photoUrl = `/uploads/profiles/${req.file.filename}`;
  db.query('UPDATE users SET photo_url = ? WHERE id = ?', [photoUrl, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur SQL' });
    res.json({ photoUrl, message: 'Photo mise à jour' });
  });
};
