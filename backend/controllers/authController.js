// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { genererOTP } = require('../utils/otp');
const { generateStrongPassword } = require('../utils/password');
const { sendOTPEmail, sendAdminRegistrationAlert } = require('../services/emailService');

exports.register = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role, zone } = req.body;

  if (!['zone_manager', 'manager'].includes(role)) {
    return res.status(400).json({ message: 'Rôle invalide' });
  }

  db.query('SELECT id FROM users WHERE email = ?', [email], async (err, rows) => {
    if (rows?.length > 0) return res.status(400).json({ message: 'Email déjà utilisé' });

    const hash = await bcrypt.hash(mot_de_passe, 10);
    db.query(
      'INSERT INTO users (nom, prenom, email, mot_de_passe, role, zone, statut) VALUES (?, ?, ?, ?, ?, ?, "en_attente")',
      [nom, prenom, email, hash, role, zone],
      async (err) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });

        try {
          await sendAdminRegistrationAlert({ nom, prenom, email, role, zone });
          console.log(`✅ Notification Admin envoyée pour ${email}`);
        } catch (mailErr) {
          console.error('❌ Erreur notification admin:', mailErr.message);
        }

        res.json({ message: 'Inscription soumise. En attente d\'approbation.' });
      }
    );
  });
};

exports.login = (req, res) => {
  const { email, mot_de_passe } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, rows) => {
    if (err || rows.length === 0) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const user = rows[0];
    if (user.statut !== 'approuve') return res.status(403).json({ message: 'Compte non approuvé par l\'admin' });

    const valide = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valide) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const otp = genererOTP();
    const expire = new Date(Date.now() + 2 * 60 * 1000);

    db.query('UPDATE users SET otp_code = ?, otp_expire = ? WHERE id = ?', [otp, expire, user.id]);

    if (process.env.DEV_MODE === 'true') {
      return res.json({ message: 'Code OTP généré (mode dev)', userId: user.id, devOtp: otp });
    }

    try {
      await sendOTPEmail(email, otp, 'login');
      console.log(`📧 OTP envoyé à ${email}`);
      res.json({ message: 'Code OTP envoyé par email', userId: user.id });
    } catch (e) {
      console.error('❌ Erreur envoi email:', e.message);
      res.status(500).json({ message: 'Erreur lors de l\'envoi du code OTP' });
    }
  });
};

exports.verifyOTP = (req, res) => {
  const { userId, otp } = req.body;

  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable' });

    const user = rows[0];
    if (user.otp_code !== otp) return res.status(401).json({ message: 'Code OTP incorrect' });
    if (new Date() > new Date(user.otp_expire)) return res.status(401).json({ message: 'Code OTP expiré' });

    db.query('UPDATE users SET otp_code = NULL, otp_expire = NULL WHERE id = ?', [userId]);

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, nom: user.nom, zone: user.zone },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    db.query('INSERT INTO access_logs (user_id, action) VALUES (?, "login")', [user.id]);
    res.json({ token, user: { id: user.id, nom: user.nom, prenom: user.prenom, role: user.role, zone: user.zone } });
  });
};


exports.forgotPassword = (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  db.query('SELECT id, nom, prenom FROM users WHERE email = ?', [email], async (err, rows) => {
    if (err || rows.length === 0) {
      return res.json({ message: 'Si cet e-mail correspond à un compte, un code a été envoyé.' });
    }

    const user = rows[0];
    const otp = genererOTP();
    const expire = new Date(Date.now() + 10 * 60 * 1000);
    const passwordExample = generateStrongPassword(12);

    db.query('INSERT INTO reset_tokens (email, token, expire_at) VALUES (?, ?, ?)', [email, otp, expire]);

    try {
      await sendOTPEmail(email, otp, 'forgot', user.prenom, passwordExample);
      res.json({ message: 'Un code de vérification a été envoyé à votre adresse e-mail.' });
    } catch (e) {
      res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email.' });
    }
  });
};

exports.verifyResetCode = (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const otp = req.body.otp?.trim();
  
  console.log(`[DEBUG] Tentative de vérification pour: ${email}`);

  db.query(
    'SELECT * FROM reset_tokens WHERE email = ? ORDER BY id DESC LIMIT 1',
    [email],
    (err, rows) => {
      if (err) {
        console.error("[ERROR] DB Error:", err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
      if (rows.length === 0) {
        console.log(`[DEBUG] Aucun enregistrement trouvé pour l'email: ${email}`);
        return res.status(400).json({ message: 'Action non autorisée ou expirée' });
      }
      
      const reset = rows[0];
      console.log(`[DEBUG] Comparaison -> Reçu: [${otp}] | Stocké: [${reset.token}]`);
      
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

  // Validation force du mot de passe
  const regexForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!regexForte.test(newPassword)) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.' });
  }

  db.query(
    'SELECT * FROM reset_tokens WHERE email = ? AND token = ? ORDER BY id DESC LIMIT 1',
    [email, otp],
    async (err, rows) => {
      if (err || rows.length === 0) return res.status(400).json({ message: 'Session de réinitialisation invalide' });

      const reset = rows[0];
      if (new Date() > new Date(reset.expire_at)) {
        return res.status(400).json({ message: 'Code expiré' });
      }

      const hash = await bcrypt.hash(newPassword, 10);
      db.query('UPDATE users SET mot_de_passe = ? WHERE email = ?', [hash, email], (updateErr) => {
        if (updateErr) return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
        db.query('DELETE FROM reset_tokens WHERE email = ?', [email]);
        res.json({ message: 'Mot de passe réinitialisé avec succès' });
      });
    }
  );
};

exports.logout = (req, res) => {
  const { userId, reason } = req.body;
  if (!userId) return res.json({ message: 'Logout sans log (pas d\'ID)' });

  const action = reason || 'logout';
  db.query('INSERT INTO access_logs (user_id, action) VALUES (?, ?)', [userId, action], (err) => {
    if (err) console.error('Erreur log déconnexion:', err.message);
    res.json({ message: 'Déconnexion enregistrée' });
  });
};
