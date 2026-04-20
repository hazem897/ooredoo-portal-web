// backend/services/emailService.js
const transporter = require('../config/nodemailer');
const path = require('path');

const LOGO_ATTACHMENT = {
  filename: 'logo.png',
  path: path.join(__dirname, '../assets/logo.png'),
  cid: 'logo'
};

const sendOTPEmail = async (email, otp, type = 'login', userPrenom = '', passwordExample = '') => {
  const isForgot = type === 'forgot';
  const subject = isForgot 
    ? `🔄 ${otp} est votre code de réinitialisation Ooredoo` 
    : `🔑 ${otp} est votre code de vérification Ooredoo`;

  const title = isForgot ? 'Réinitialisation de mot de passe' : 'Code de vérification';
  const intro = isForgot 
    ? `Bonjour <strong>${userPrenom}</strong>,<br>Vous avez demandé la réinitialisation de votre mot de passe.`
    : `Bonjour,<br>Vous tentez de vous connecter au portail interne.`;
  
  const expiry = isForgot ? '10 minutes' : '2 minutes';

  const strongPasswordExampleHtml = isForgot && passwordExample ? `
    <div style="margin-top: 25px; padding: 15px; border: 1px dashed #ccc; border-radius: 8px; background: #fff;">
        <p style="margin: 0 0 10px 0; color: #666; font-size: 13px;">💡 Exemple de mot de passe fort conseillé :</p>
        <code style="display: block; padding: 8px; background: #eee; border-radius: 4px; color: #E30613; font-weight: bold; font-size: 16px; letter-spacing: 1px;">${passwordExample}</code>
    </div>
  ` : '';

  const html = `
    <div style="max-width: 600px; margin: 20px auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #E30613; padding: 25px; text-align: center;">
            <img src="cid:logo" width="160" alt="Ooredoo">
        </div>
        <div style="padding: 40px; background-color: #ffffff; text-align: center;">
            <h2 style="color: #333333; margin-top: 0; font-size: 22px;">${title}</h2>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">${intro}</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border: 2px ${isForgot?'solid':'dashed'} #E30613; border-radius: 10px; display: inline-block;">
                <span style="font-size: 38px; font-weight: 800; color: #E30613; letter-spacing: 5px; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #999999; font-size: 14px; margin-bottom: 30px;">
                Ce code est valide pendant <strong style="color: #E30613;">${expiry}</strong>.
            </p>
            ${strongPasswordExampleHtml}
            <div style="padding: 15px; background-color: #f9f9f9; border-radius: 6px; font-size: 12px; color: #666; font-style: italic; margin-top: 25px;">
                Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.
            </div>
        </div>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="margin: 0; color: #999; font-size: 11px;">© 2026 Ooredoo Tunisie - Direction Technique</p>
        </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"Ooredoo Portal" <noreply@ooredoo.tn>`,
    to: email,
    subject,
    html,
    attachments: [LOGO_ATTACHMENT]
  });
};

const sendAdminRegistrationAlert = async (userData) => {
  const html = `
    <div style="max-width: 600px; margin: 20px auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #E30613; padding: 25px; text-align: center;">
            <img src="cid:logo" width="160" alt="Ooredoo">
        </div>
        <div style="padding: 40px; background-color: #ffffff;">
            <h2 style="color: #333333; margin-top: 0; font-size: 22px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">Nouvelle Demande d'Accès</h2>
            <p style="color: #666666; font-size: 16px;">Un nouvel utilisateur souhaite rejoindre le portail :</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                <table width="100%" cellspacing="0" cellpadding="5">
                    <tr><td><strong>Nom :</strong></td><td>${userData.prenom} ${userData.nom}</td></tr>
                    <tr><td><strong>Email :</strong></td><td>${userData.email}</td></tr>
                    <tr><td><strong>Rôle :</strong></td><td><span style="background: #E30613; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${userData.role}</span></td></tr>
                </table>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:5173/utilisateurs" style="background-color: #E30613; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Gérer les demandes</a>
            </div>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 11px;">Système Ooredoo</p>
        </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"Système Ooredoo" <noreply@ooredoo.tn>`,
    to: 'yessingsm4@gmail.com',
    subject: '🔔 Nouvelle demande d\'inscription',
    html,
    attachments: [LOGO_ATTACHMENT]
  });
};

const sendDailyReportEmail = async (logs, attachments, today) => {
    const html = `
    <div style="max-width: 600px; margin: 20px auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #E30613; padding: 30px; text-align: center;">
            <img src="cid:logo" width="180" alt="Ooredoo">
        </div>
        <div style="padding: 40px; background-color: #ffffff;">
            <h2 style="color: #333; margin-top: 0; font-size: 24px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">Rapport Quotidien d'Activité</h2>
            <p style="color: #666; font-size: 16px;">Bonjour Administrateur, le rapport du <strong>${today}</strong> est prêt.</p>
            <div style="background: linear-gradient(135deg, #E30613 0%, #ff4d4d 100%); padding: 20px; border-radius: 10px; color: white; margin: 30px 0; text-align: center;">
                <div style="font-size: 14px; opacity: 0.9;">Nombre d'actions</div>
                <div style="font-size: 36px; font-weight: 800;">${logs.length}</div>
            </div>
            <p style="color: #666; font-size: 15px;">Détails en pièces jointes (PDF, Excel, CSV).</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} Ooredoo Tunisie</p>
        </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"Système Ooredoo" <noreply@ooredoo.tn>`,
    to: 'yessingsm4@gmail.com',
    subject: `📊 Rapport d'Accès Ooredoo - ${today}`,
    html,
    attachments: [LOGO_ATTACHMENT, ...attachments]
  });
}

const sendNewPasswordEmail = async (email, newPassword, userPrenom) => {
  const html = `
    <div style="max-width: 600px; margin: 20px auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #E30613; padding: 25px; text-align: center;">
            <img src="cid:logo" width="160" alt="Ooredoo">
        </div>
        <div style="padding: 40px; background-color: #ffffff; text-align: center;">
            <h2 style="color: #333333; margin-top: 0; font-size: 22px;">Nouveau Mot de Passe</h2>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">Bonjour <strong>${userPrenom}</strong>,<br>Suite à votre demande, un nouveau mot de passe fort a été généré pour votre compte.</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border: 2px solid #E30613; border-radius: 10px; display: inline-block;">
                <span style="font-size: 20px; font-weight: 800; color: #E30613; font-family: monospace;">${newPassword}</span>
            </div>
            <p style="color: #E30613; font-weight: bold; font-size: 14px; margin: 20px 0 30px 0;">
                Veuillez changer ce mot de passe dès votre première connexion.
            </p>
            <div style="padding: 15px; background-color: #f9f9f9; border-radius: 6px; font-size: 12px; color: #666; font-style: italic;">
                Si vous n'êtes pas à l'origine de cette demande, veuillez contacter un administrateur immédiatement.
            </div>
        </div>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="margin: 0; color: #999; font-size: 11px;">© 2026 Ooredoo Tunisie - Direction Technique</p>
        </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"Ooredoo Portal" <noreply@ooredoo.tn>`,
    to: email,
    subject: `🔐 Nouveau mot de passe Ooredoo`,
    html,
    attachments: [LOGO_ATTACHMENT]
  });
};

const sendStatusEmail = async (email, nom, prenom, statut) => {
  let sujet = "";
  let messageTitre = "";
  let messageCorps = "";
  let couleur = "#E30613";

  switch (statut) {
    case 'approuve':
      sujet = "✅ Votre compte Ooredoo Portal a été approuvé";
      messageTitre = "Bienvenue sur le Portail";
      messageCorps = "Votre demande d'accès a été acceptée. Vous pouvez maintenant vous connecter.";
      couleur = "#1A8A4E";
      break;
    case 'refuse':
      sujet = "ℹ️ Information concernant votre accès";
      messageTitre = "Demande Non Approuvée";
      messageCorps = "Votre demande d'accès au portail a été refusée.";
      break;
    case 'suspendu':
      sujet = "⚠️ Compte Ooredoo Portal suspendu";
      messageTitre = "Compte Suspendu";
      messageCorps = "Votre compte a été temporairement suspendu par un administrateur.";
      couleur = "#F97316";
      break;
    case 'supprime':
      sujet = "🚫 Suppression de votre compte Ooredoo";
      messageTitre = "Compte Supprimé";
      messageCorps = "Votre compte a été définitivement supprimé du système.";
      break;
  }

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: ${couleur}; padding: 30px; text-align: center;">
          <img src="cid:logo" width="140" alt="Ooredoo">
      </div>
      <div style="padding: 40px; background-color: #ffffff; text-align: center;">
        <h2 style="color: ${couleur}; margin-bottom: 20px; font-size: 24px;">${messageTitre}</h2>
        <p style="font-size: 16px; color: #333;">Bonjour <strong>${prenom} ${nom}</strong>,</p>
        <p style="font-size: 16px; color: #666; line-height: 1.6;">${messageCorps}</p>
        ${statut === 'approuve' ? `
        <div style="margin-top: 30px;">
          <a href="http://localhost:5173/login" style="display: inline-block; padding: 14px 30px; background-color: ${couleur}; color: #ffffff; text-decoration: none; border-radius: 30px; font-weight: bold; transition: opacity 0.2s;">Accéder au Portail</a>
        </div>
        ` : ''}
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
        © 2026 Ooredoo Tunisie. Ce message est automatique.<br>
        Direction Technique - Support Interne
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"Ooredoo Portal" <noreply@ooredoo.tn>`,
    to: email,
    subject: sujet,
    html,
    attachments: [LOGO_ATTACHMENT]
  });
};

module.exports = {
  sendOTPEmail,
  sendAdminRegistrationAlert,
  sendDailyReportEmail,
  sendNewPasswordEmail,
  sendStatusEmail
};
