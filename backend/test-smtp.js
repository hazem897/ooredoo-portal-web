// test-smtp.js — Script de test de connexion Gmail SMTP
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

console.log('='.repeat(50));
console.log('🔍 TEST CONNEXION SMTP GMAIL');
console.log('='.repeat(50));
console.log(`📧 EMAIL_USER : ${EMAIL_USER}`);
console.log(`🔑 EMAIL_PASS : ${EMAIL_PASS ? EMAIL_PASS.slice(0, 4) + '************' : '❌ NON DÉFINI'}`);
console.log('='.repeat(50));

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❌ EMAIL_USER ou EMAIL_PASS manquant dans le fichier .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

console.log('\n⏳ Vérification de la connexion SMTP...\n');

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ ÉCHEC DE LA CONNEXION SMTP');
    console.error('   Message :', error.message);
    console.error('\n📌 Causes possibles :');
    console.error('   1. Le mot de passe d\'application Gmail a expiré ou est invalide');
    console.error('   2. La vérification en 2 étapes n\'est pas activée sur le compte');
    console.error('   3. L\'email est incorrect');
    console.error('\n🔗 Solution : Générez un nouveau App Password sur :');
    console.error('   https://myaccount.google.com/apppasswords');
    process.exit(1);
  } else {
    console.log('✅ CONNEXION SMTP RÉUSSIE !');
    console.log('   Le serveur Gmail est prêt à envoyer des emails.\n');
    console.log('⏳ Envoi d\'un email de test...\n');

    const mailOptions = {
      from: `"Test SMTP" <${EMAIL_USER}>`,
      to: EMAIL_USER, // envoi à soi-même pour tester
      subject: '✅ Test SMTP — Connexion Gmail réussie',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
          <div style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; margin: auto;">
            <h2 style="color: #28a745;">✅ Connexion SMTP réussie !</h2>
            <p>Cet email confirme que votre configuration Gmail SMTP fonctionne correctement.</p>
            <hr/>
            <p><strong>Email expéditeur :</strong> ${EMAIL_USER}</p>
            <p><strong>Date du test :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            <hr/>
            <p style="color: #666; font-size: 13px;">Ce message a été envoyé automatiquement par le script de test SMTP.</p>
          </div>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Échec de l\'envoi de l\'email de test :', err.message);
        process.exit(1);
      } else {
        console.log('✅ EMAIL DE TEST ENVOYÉ AVEC SUCCÈS !');
        console.log(`   → Vérifiez la boîte de réception de : ${EMAIL_USER}`);
        console.log(`   → Message ID : ${info.messageId}`);
        console.log('\n🎉 Votre configuration SMTP est parfaitement fonctionnelle !');
      }
    });
  }
});
