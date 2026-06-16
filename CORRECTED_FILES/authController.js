// backend/controllers/authController.js - VERSION CORRIGÉE ET COMPLÈTE
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { genererOTP } = require('../utils/otp');
const { generateStrongPassword } = require('../utils/password');
const { sendOTPEmail, sendAdminRegistrationAlert } = require('../services/emailService');

exports.register = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role, zone } = req.body;

  // Validation du rôle
  if (!['zone_manager', 'manager'].includes(role)) {
    return res.status(400).json({ message: 'Rôle invalide' });
  }

  db.query('SELECT id FROM users WHERE email = ?', [email], async (err, rows) => {
    // ✅ CORRECTION: Vérifier l'erreur DB d'abord
    if (err) {
      console.error('[REGISTER ERROR] DB Query Error:', err.message);
      return res.status(500).json({ message: 'Erreur serveur lors de la vérification email' });
    }

    if (rows?.length > 0) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    try {
      const hash = await bcrypt.hash(mot_de_passe, 10);
      db.query(
        'INSERT INTO users (nom, prenom, email, mot_de_passe, role, zone, statut) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nom, prenom, email, hash, role, zone, 'en_attente'],
        async (err) => {
          if (err) {
            console.error('[REGISTER ERROR] Insert failed:', err.message);
            return res.status(500).json({ message: 'Erreur serveur' });
          }

          try {
            await sendAdminRegistrationAlert({ nom, prenom, email, role, zone });
            console.log(`✅ Notification Admin envoyée pour ${email}`);
          } catch (mailErr) {
            console.error('❌ Erreur notification admin:', mailErr.message);
          }

          res.json({ message: 'Inscription soumise. En attente d\'approbation.' });
        }
      );
    } catch (hashErr) {
      console.error('[REGISTER ERROR] Hash failed:', hashErr.message);
      res.status(500).json({ message: 'Erreur lors du hachage du mot de passe' });
    }
  });
};

exports.login = (req, res) => {
  const { email, mot_de_passe } = req.body;

  console.log(`[LOGIN] Tentative connexion pour: ${email}`);

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, rows) => {
    if (err) {
      console.error('[LOGIN ERROR] DB Query Error:', err.message);
      return res.status(500).json({ message: 'Erreur serveur lors de la vérification email' });
    }

    if (!rows || rows.length === 0) {
      console.warn(`[LOGIN] Email non trouvé: ${email}`);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = rows[0];
    console.log(`[LOGIN] Utilisateur trouvé: ${user.email}, Statut: ${user.statut}`);

    if (user.statut !== 'approuve') {
      console.warn(`[LOGIN] Compte non approuvé pour: ${email} (statut: ${user.statut})`);
      return res.status(403).json({ message: 'Compte non approuvé par l\'admin' });
    }

    try {
      const valide = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
      if (!valide) {
        console.warn(`[LOGIN] Mot de passe incorrect pour: ${email}`);
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      const otp = genererOTP();
      const expire = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

      console.log(`[LOGIN] OTP généré pour ${email}: ${otp}`);

      db.query(
        'UPDATE users SET otp_code = ?, otp_expire = ? WHERE id = ?',
        [otp, expire, user.id],
        (err) => {
          if (err) {
            console.error('[LOGIN ERROR] Erreur mise à jour OTP:', err.message);
            return res.status(500).json({ message: 'Erreur lors de la génération de l\'OTP' });
          }

          // ✅ Mode DEV: Affiche OTP sur le frontend
          if (process.env.DEV_MODE === 'true') {
            console.log(`[LOGIN] Mode DEV: OTP affichée: ${otp}`);
            return res.json({ 
              message: 'Code OTP généré (mode dev)', 
              userId: user.id, 
              devOtp: otp 
            });
          }

          // Mode PRODUCTION: Envoie OTP par email
          try {
            sendOTPEmail(email, otp, 'login');
            console.log(`📧 OTP envoyé à ${email}`);
            res.json({ message: 'Code OTP envoyé par email', userId: user.id });
          } catch (e) {
            console.error('❌ Erreur envoi email:', e.message);
            res.status(500).json({ message: 'Erreur lors de l\'envoi du code OTP' });
          }
        }
      );
    } catch (compareErr) {
      console.error('[LOGIN ERROR] Password compare failed:', compareErr.message);
      return res.status(500).json({ message: 'Erreur lors de la vérification' });
    }
  });
};

exports.verifyOTP = (req, res) => {
  const { userId, otp } = req.body;

  console.log(`[VERIFY OTP] Tentative vérification OTP pour userId: ${userId}`);

  if (!userId || !otp) {
    return res.status(400).json({ message: 'userId et otp requis' });
  }

  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, rows) => {
    if (err) {
      console.error('[VERIFY OTP ERROR] DB Error:', err.message);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (!rows || rows.length === 0) {
      console.warn(`[VERIFY OTP] Utilisateur non trouvé: ${userId}`);
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const user = rows[0];

    if (user.otp_code !== otp) {
      console.warn(`[VERIFY OTP] Code incorrect pour userId ${userId}. Attendu: ${user.otp_code}, Reçu: ${otp}`);
      return res.status(401).json({ message: 'Code OTP incorrect' });
    }

    if (new Date() > new Date(user.otp_expire)) {
      console.warn(`[VERIFY OTP] Code expiré pour userId ${userId}`);
      return res.status(401).json({ message: 'Code OTP expiré' });
    }

    console.log(`[VERIFY OTP] ✅ OTP valide pour userId: ${userId}`);

    // Nettoie l'OTP après utilisation
    db.query('UPDATE users SET otp_code = NULL, otp_expire = NULL WHERE id = ?', [userId], (err) => {
      if (err) console.error('❌ Erreur nettoyage OTP:', err.message);
    });

    // ✅ Génère le JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        email: user.email, 
        nom: user.nom, 
        prenom: user.prenom,
        zone: user.zone 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log(`[VERIFY OTP] Token généré pour: ${user.email}`);

    // Log la connexion
    db.query(
      'INSERT INTO access_logs (user_id, action) VALUES (?, ?)',
      [user.id, 'login'],
      (err) => {
        if (err) console.error('❌ Erreur log login:', err.message);
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        zone: user.zone,
        email: user.email
      }
    });
  });
};

exports.forgotPassword = (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  db.query(
    'SELECT id, nom, prenom FROM users WHERE email = ?',
    [email],
    async (err, rows) => {
      if (err || rows.length === 0) {
        return res.json({ message: 'Si cet e-mail correspond à un compte, un code a été envoyé.' });
      }

      const user = rows[0];
      const otp = genererOTP();
      const expire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      const passwordExample = generateStrongPassword(12);

      db.query(
        'INSERT INTO reset_tokens (email, token, expire_at) VALUES (?, ?, ?)',
        [email, otp, expire],
        (err) => {
          if (err) console.error('❌ Erreur insert reset_tokens:', err.message);
        }
      );

      try {
        await sendOTPEmail(email, otp, 'forgot', user.prenom, passwordExample);
        res.json({ message: 'Un code de vérification a été envoyé à votre adresse e-mail.' });
      } catch (e) {
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email.' });
      }
    }
  );
};

exports.verifyResetCode = (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const otp = req.body.otp?.trim();

  console.log(`[VERIFY RESET] Tentative de vérification pour: ${email}`);

  db.query(
    'SELECT * FROM reset_tokens WHERE email = ? ORDER BY id DESC LIMIT 1',
    [email],
    (err, rows) => {
      if (err) {
        console.error('[VERIFY RESET ERROR] DB Error:', err.message);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (rows.length === 0) {
        console.log(`[VERIFY RESET] Aucun enregistrement trouvé pour l'email: ${email}`);
        return res.status(400).json({ message: 'Action non autorisée ou expirée' });
      }

      const reset = rows[0];
      console.log(`[VERIFY RESET] Comparaison -> Reçu: [${otp}] | Stocké: [${reset.token}]`);

      if (reset.token !== otp) {
        return res.status(400).json({ message: 'Le code saisi est incorrect.' });
      }

      const expiry = new Date(reset.expire_at);
      const now = new Date();
      if (now > expiry) {
        return res.status(400).json({ message: 'Ce code a expiré.' });
      }

      res.json({ message: 'Code valide' });
    }
  );
};

exports.resetPassword = (req, res) => {
  const { email, otp, newPassword } = req.body;

  // ✅ Validation forte du mot de passe
  const regexForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!regexForte.test(newPassword)) {
    return res.status(400).json({
      message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
    });
  }

  db.query(
    'SELECT * FROM reset_tokens WHERE email = ? AND token = ? ORDER BY id DESC LIMIT 1',
    [email, otp],
    async (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(400).json({ message: 'Session de réinitialisation invalide' });
      }

      const reset = rows[0];
      if (new Date() > new Date(reset.expire_at)) {
        return res.status(400).json({ message: 'Code expiré' });
      }

      try {
        const hash = await bcrypt.hash(newPassword, 10);
        db.query(
          'UPDATE users SET mot_de_passe = ? WHERE email = ?',
          [hash, email],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
            }
            db.query('DELETE FROM reset_tokens WHERE email = ?', [email], (delErr) => {
              if (delErr) console.error('❌ Erreur suppression reset_tokens:', delErr.message);
            });
            res.json({ message: 'Mot de passe réinitialisé avec succès' });
          }
        );
      } catch (hashErr) {
        console.error('[RESET ERROR] Hash failed:', hashErr.message);
        res.status(500).json({ message: 'Erreur lors du hachage du mot de passe' });
      }
    }
  );
};

exports.logout = (req, res) => {
  const { userId, reason } = req.body;
  if (!userId) {
    return res.json({ message: 'Logout sans log (pas d\'ID)' });
  }

  const action = reason || 'logout';
  db.query(
    'INSERT INTO access_logs (user_id, action) VALUES (?, ?)',
    [userId, action],
    (err) => {
      if (err) console.error('❌ Erreur log déconnexion:', err.message);
      res.json({ message: 'Déconnexion enregistrée' });
    }
  );
};
