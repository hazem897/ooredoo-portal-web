const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function test() {
  console.log('📨 Tentative d\'envoi de mail de test...');
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'yessingsm4@gmail.com',
      subject: 'Test Email Ooredoo Portal',
      text: 'Si vous recevez ce mail, la configuration est correcte.'
    });
    console.log('✅ Mail envoyé avec succès !');
  } catch (err) {
    console.error('❌ Erreur d\'envoi:', err.message);
  }
}

test();
