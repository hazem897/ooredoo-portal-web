// backend/controllers/userController.js
const db = require('../config/db');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');

exports.getAllUsers = (req, res) => {
  const sql = `
    SELECT u.id, u.nom, u.prenom, u.email, u.role, u.statut, u.photo_url, u.cree_le,
    (SELECT MAX(cree_le) FROM access_logs WHERE user_id = u.id AND action = 'login') as derniere_connexion
    FROM users u
    ORDER BY u.cree_le DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json(rows);
  });
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

    db.query('DELETE FROM users WHERE id = ?', [req.params.id], (delErr) => {
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

exports.creerUser = async (req, res) => {
  const { nom, prenom, email, role, password } = req.body;

  if (!nom || !prenom || !email || !role || !password) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
  }

  try {
    // Vérifier si l'email existe déjà
    db.query('SELECT id FROM users WHERE email = ?', [email], async (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erreur SQL' });
      if (rows.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé' });

      const hash = await bcrypt.hash(password, 10);

      db.query(
        'INSERT INTO users (nom, prenom, email, mot_de_passe, role, statut) VALUES (?, ?, ?, ?, ?, "approuve")',
        [nom, prenom, email, hash, role],
        async (insErr, result) => {
          if (insErr) {
            console.error(insErr);
            return res.status(500).json({ message: 'Erreur lors de la création' });
          }

          // Envoyer l'email de bienvenue avec les identifiants
          try {
            console.log(`📧 Envoi de l'e-mail de bienvenue à ${email}...`);
            await emailService.sendAccountCreatedEmail(email, nom, prenom, password, role);
            console.log("✅ E-mail envoyé avec succès");
            res.json({ message: 'Utilisateur créé avec succès et e-mail envoyé !' });
          } catch (mailErr) {
            console.error("❌ Erreur e-mail détails:", mailErr);
            res.json({ message: 'Utilisateur créé, mais l\'e-mail n\'a pas pu être envoyé. (Vérifiez la config SMTP)' });
          }
        }
      );
    });
  } catch (e) {
    console.error("❌ Erreur critique serveur:", e);
    res.status(500).json({ message: 'Erreur critique serveur' });
  }
};

exports.reinitialiserMdp = async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ message: 'Données manquantes' });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);

    db.query('SELECT email, nom, prenom FROM users WHERE id = ?', [userId], async (err, rows) => {
      if (err || rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

      const user = rows[0];

      db.query('UPDATE users SET mot_de_passe = ? WHERE id = ?', [hash, userId], async (updErr) => {
        if (updErr) return res.status(500).json({ message: 'Erreur SQL' });

        try {
          await emailService.sendNewPasswordEmail(user.email, newPassword, user.prenom);
          res.json({ message: 'Mot de passe réinitialisé et envoyé par e-mail !' });
        } catch (mailErr) {
          res.json({ message: 'Mot de passe changé, mais échec de l\'envoi de l\'e-mail.' });
        }
      });
    });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
