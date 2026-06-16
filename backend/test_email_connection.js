// Test de connexion Email
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔍 Configuration Email Détectée:');
console.log('═══════════════════════════════════');
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`🔐 EMAIL_PASS: ${process.env.EMAIL_PASS ? '***' : 'NON DÉFINI'}`);
console.log(`🌐 EMAIL_HOST: ${process.env.EMAIL_HOST || 'GMAIL (par défaut)'}`);
console.log(`🔌 EMAIL_PORT: ${process.env.EMAIL_PORT || 'DEFAULT'}`);
console.log('═══════════════════════════════════\n');

const transporterConfig = process.env.EMAIL_HOST ? {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT === '465',
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

// Test 1: Vérifier la connexion
console.log('⏳ Test 1: Vérification de la connexion...\n');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ ERREUR DE CONNEXION:');
    console.log('───────────────────────');
    console.log(error);
    console.log('\n💡 Solutions possibles:');
    console.log('1️⃣  Gmail: Créez un "App Password" (pas votre mot de passe Gmail):');
    console.log('    • Allez sur: myaccount.google.com/apppasswords');
    console.log('    • Sélectionnez: Mail et Windows');
    console.log('    • Copiez le mot de passe généré dans .env\n');
    console.log('2️⃣  Vérifiez que 2FA est activé sur votre compte Google');
    console.log('3️⃣  Utilisez un autre service (Brevo, SendGrid, etc.)\n');
    process.exit(1);
  } else {
    console.log('✅ Connexion réussie!\n');
    
    // Test 2: Envoyer un email de test
    console.log('⏳ Test 2: Envoi d\'un email de test...\n');
    
    const testEmail = {
      from: process.env.EMAIL_FROM || `"Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ Test de Connexion Email - Ooredoo Portal',
      html: `
        <div style="background: #f0f0f0; padding: 20px; text-align: center;">
          <h2>✅ Test d'Email Réussi!</h2>
          <p>Si vous recevez cet email, votre configuration est correcte.</p>
          <p>Vous pouvez maintenant utiliser le système OTP.</p>
        </div>
      `
    };

    transporter.sendMail(testEmail, (err, info) => {
      if (err) {
        console.log('❌ ERREUR LORS DE L\'ENVOI:');
        console.log('─────────────────────────');
        console.log(err);
        process.exit(1);
      } else {
        console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS!');
        console.log('─────────────────────────');
        console.log(`📨 Message ID: ${info.messageId}`);
        console.log(`✉️  Destinataire: ${testEmail.to}`);
        console.log('\n🎉 Votre configuration email fonctionne!\n');
        process.exit(0);
      }
    });
  }
});
