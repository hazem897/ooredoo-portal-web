// backend/config/nodemailer.js
const nodemailer = require('nodemailer');

// Si l'utilisateur définit un EMAIL_HOST (ex: smtp-relay.brevo.com), on l'utilise.
// Sinon, on retombe sur Gmail par défaut.
const transporterConfig = process.env.EMAIL_HOST ? {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT === '465', // true pour 465, false pour autres
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
} : {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

const transporter = nodemailer.createTransport(transporterConfig);

module.exports = transporter;
