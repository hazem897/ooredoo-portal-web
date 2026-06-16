// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { genererOTP } = require('../utils/otp');
const { generateStrongPassword } = require('../utils/password');
const { sendOTPEmail, sendAdminRegistrationAlert } = require('../services/emailService');
const { validateStrongPassword, validateEmail, validateName, validateRole } = require('../utils/validation');

exports.register = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role, zone } = req.body;

  // ✅ Validation des champs requis
  if (!nom || !prenom || !email || !mot_de_passe || !role) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
  }

  // ✅ Validation du rôle
  if (!['zone_manager', 'manager'].includes(role)) {
    return res.status(400).json({ message: 'Rôle invalide' });
  }

  // ✅ Validation du nom
  if (!validateName(nom) || !validateName(prenom)) {
    return res.status(400).json({ message: 'Le nom et le prénom doivent être valides' });
  }

  // ✅ Validation de l'email
  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Email invalide' });
  }

  // ✅ Validation du mot de passe fort
  const passwordValidation = validateStrongPassword(mot_de_passe);
  if (!passwordValidation.valid) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  db.query('SELECT id FROM users WHERE email = ?', [email], async (err, rows) => {
    if (err) {
      console.error('[REGISTER ERROR] DB Query Error:', err.message);
      return res.status(500).json({ message: 'Erreur serveur lors de la vérification email' });
    }

    if (rows?.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    try {
      const hash = await bcrypt.hash(mot_de_passe, 10);
      
      db.query(
        'INSERT INTO users (nom, prenom, email, mot_de_passe, role, zone, statut) VALUES (?, ?, ?, ?, ?, ?, "en_attente")',
        [nom, prenom, email, hash, role, zone],
        async (err) => {
          if (err) {
            console.error('[REGISTER ERROR] Erreur INSERT:', err.message);
            return res.status(500).json({ message: 'Erreur lors de l\'inscription' });
          }

          try {
            await sendAdminRegistrationAlert({ nom, prenom, email, role, zone });
            console.log(`✅ Notification Admin envoyée pour ${email}`);
          } catch (mailErr) {
            console.error('[REGISTER ERROR] Erreur notification admin:', mailErr.message);
          }

          res.json({ message: 'Inscription soumise. En attente d\'approbation.' });
        }
      );
    } catch (hashErr) {
      console.error('[REGISTER ERROR] Erreur bcrypt:', hashErr.message);
      res.status(500).json({ message: 'Erreur lors du traitement de l\'inscription' });
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

    // ✅ Génère le JWT D'ABORD
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

    // ✅ Préparer la réponse
    const response = {
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        zone: user.zone,
        email: user.email
      }
    };

    // ✅ Envoyer la réponse AU CLIENT
    res.json(response);

    // ✅ PUIS faire les opérations asynchrones (cleanup OTP et logging)
    // Utiliser setImmediate pour éviter la race condition
    setImmediate(() => {
      // Cleanup OTP de manière non-bloquante
      db.query('UPDATE users SET otp_code = NULL, otp_expire = NULL WHERE id = ?', [userId], (err) => {
        if (err) console.error('[VERIFY OTP] Erreur nettoyage OTP:', err.message);
      });

      // Log l'accès de manière non-bloquante
      db.query('INSERT INTO access_logs (user_id, action) VALUES (?, ?)', [user.id, 'login'], (err) => {
        if (err) console.error('[VERIFY OTP] Erreur log login:', err.message);
      });
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
    const expire = new Date(Date.now() + 10 * 60 * 1000);
    const passwordExample = generateStrongPassword(12);

    db.query('INSERT INTO reset_tokens (email, token, expire_at) VALUES (?, ?, ?)', [email, otp, expire], (err) => {
      if (err) console.error('❌ Erreur insert reset_tokens:', err.message);
    });

    if (process.env.DEV_MODE === 'true') {
      console.log(`[FORGOT PASSWORD] Mode DEV: OTP envoyé: ${otp}`);
      return res.json({ message: 'Code de vérification généré (mode dev)', devOtp: otp, email });
    }

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
  
  // ✅ Validation des paramètres
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email et code sont obligatoires' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Email invalide' });
  }

  console.log(`[VERIFY RESET CODE] Tentative vérification pour: ${email}`);

  db.query(
    'SELECT * FROM reset_tokens WHERE email = ? ORDER BY id DESC LIMIT 1',
    [email],
    (err, rows) => {
      if (err) {
        console.error('[VERIFY RESET CODE] DB Error:', err.message);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
      if (!rows || rows.length === 0) {
        console.warn(`[VERIFY RESET CODE] Aucun enregistrement trouvé pour: ${email}`);
        return res.status(400).json({ message: 'Aucune demande de réinitialisation valide trouvée' });
      }
      
      const reset = rows[0];
      
      // ✅ Vérifier l'expiration
      const expiry = new Date(reset.expire_at);
      const now = new Date();
      if (now > expiry) {
        console.warn(`[VERIFY RESET CODE] Code expiré pour: ${email}`);
        return res.status(400).json({ message: 'Ce code a expiré' });
      }
      
      // ✅ Vérifier le code
      if (reset.token !== otp) {
        console.warn(`[VERIFY RESET CODE] Code incorrect pour: ${email}`);
        return res.status(401).json({ message: 'Le code saisi est incorrect' });
      }
      
      console.log(`[VERIFY RESET CODE] ✅ Code valide pour: ${email}`);
      res.json({ message: 'Code valide' });
    }
  );
};

exports.resetPassword = (req, res) => {
  const { email, otp, newPassword } = req.body;

  // ✅ Validation des paramètres
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, code et nouveau mot de passe obligatoires' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Email invalide' });
  }

  // ✅ Validation du mot de passe fort
  const passwordValidation = validateStrongPassword(newPassword);
  if (!passwordValidation.valid) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  console.log(`[RESET PASSWORD] Tentative pour: ${email}`);

  db.query(
    'SELECT * FROM reset_tokens WHERE email = ? AND token = ? ORDER BY id DESC LIMIT 1',
    [email, otp],
    async (err, rows) => {
      if (err) {
        console.error('[RESET PASSWORD] DB Error:', err.message);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (!rows || rows.length === 0) {
        console.warn(`[RESET PASSWORD] Code invalide pour: ${email}`);
        return res.status(400).json({ message: 'Session de réinitialisation invalide' });
      }

      const reset = rows[0];
      
      // ✅ Vérifier l'expiration
      if (new Date() > new Date(reset.expire_at)) {
        console.warn(`[RESET PASSWORD] Code expiré pour: ${email}`);
        return res.status(400).json({ message: 'Code expiré' });
      }

      try {
        const hash = await bcrypt.hash(newPassword, 10);
        
        db.query(
          'UPDATE users SET mot_de_passe = ? WHERE email = ?',
          [hash, email],
          (updateErr) => {
            if (updateErr) {
              console.error('[RESET PASSWORD] Erreur UPDATE:', updateErr.message);
              return res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe' });
            }

            // Cleanup tokens de manière non-bloquante
            setImmediate(() => {
              db.query('DELETE FROM reset_tokens WHERE email = ?', [email], (delErr) => {
                if (delErr) console.error('[RESET PASSWORD] Erreur suppression tokens:', delErr.message);
              });
            });

            console.log(`[RESET PASSWORD] ✅ Mot de passe réinitialisé pour: ${email}`);
            res.json({ message: 'Mot de passe réinitialisé avec succès' });
          }
        );
      } catch (hashErr) {
        console.error('[RESET PASSWORD] Erreur bcrypt:', hashErr.message);
        res.status(500).json({ message: 'Erreur lors du traitement du mot de passe' });
      }
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
