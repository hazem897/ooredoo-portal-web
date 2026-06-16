// backend/config/nodemailer.js
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuration Gmail SMTP avec mot de passe d'application Google
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // Mot de passe d'application Google (16 caractères)
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Vérification de la connexion SMTP au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ [SMTP] Connexion Gmail échouée:', error.message);
    console.error('   → Vérifiez EMAIL_USER et EMAIL_PASS dans .env');
    console.error('   → EMAIL_PASS doit être un mot de passe App Google (16 chiffres)');
    console.error('   → Créez-en un sur: https://myaccount.google.com/apppasswords');
  } else {
    console.log('✅ [SMTP] Connexion Gmail réussie! Prêt à envoyer des emails.');
  }
});

module.exports = transporter;

