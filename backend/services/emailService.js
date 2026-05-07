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
    from: process.env.EMAIL_FROM || `"Ooredoo Portal" <noreply@ooredoo.tn>`,
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
                <a href="${process.env.BASE_URL || 'http://localhost:5173'}/utilisateurs" style="background-color: #E30613; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Gérer les demandes</a>
            </div>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 11px;">Système Ooredoo</p>
        </div>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Système Ooredoo" <noreply@ooredoo.tn>`,
    to: process.env.ADMIN_EMAIL || 'yessingsm4@gmail.com',
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
    from: process.env.EMAIL_FROM || `"Système Ooredoo" <noreply@ooredoo.tn>`,
    to: process.env.ADMIN_EMAIL || 'yessingsm4@gmail.com',
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
    from: process.env.EMAIL_FROM || `"Ooredoo Portal" <noreply@ooredoo.tn>`,
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
          <a href="${process.env.BASE_URL || 'http://localhost:5173'}/login" style="display: inline-block; padding: 14px 30px; background-color: ${couleur}; color: #ffffff; text-decoration: none; border-radius: 30px; font-weight: bold; transition: opacity 0.2s;">Accéder au Portail</a>
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
    from: process.env.EMAIL_FROM || `"Ooredoo Portal" <noreply@ooredoo.tn>`,
    to: email,
    subject: sujet,
    html,
    attachments: [LOGO_ATTACHMENT]
  });
};

const sendAccountCreatedEmail = async (email, nom, prenom, password, role) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #E30613; padding: 30px; text-align: center;">
          <img src="cid:logo" width="140" alt="Ooredoo">
      </div>
      <div style="padding: 40px; background-color: #ffffff;">
        <h2 style="color: #E30613; margin-bottom: 20px; font-size: 24px; text-align: center;">Bienvenue sur le Portail Ooredoo</h2>
        <p style="font-size: 16px; color: #333;">Bonjour <strong>${prenom} ${nom}</strong>,</p>
        <p style="font-size: 16px; color: #666; line-height: 1.6;">Un compte a été créé pour vous par un administrateur. Voici vos identifiants de connexion :</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #E30613;">
          <p style="margin: 5px 0;"><strong>📧 Email :</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>🔑 Mot de passe :</strong> <code style="background: #eee; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${password}</code></p>
          <p style="margin: 5px 0;"><strong>👤 Rôle :</strong> ${role}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.BASE_URL || 'http://localhost:5173'}/login" style="display: inline-block; padding: 14px 30px; background-color: #E30613; color: #ffffff; text-decoration: none; border-radius: 30px; font-weight: bold;">Se connecter maintenant</a>
        </div>
        
        <p style="font-size: 13px; color: #999; margin-top: 30px; text-align: center; font-style: italic;">
          Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion dans les paramètres de votre profil.
        </p>
      </div>
      <div style="padding: 20px; background-color: #f4f4f4; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee;">
        © 2026 Ooredoo Tunisie - Support Technique
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Ooredoo Portal" <noreply@ooredoo.tn>`,
    to: email,
    subject: "🎉 Bienvenue sur votre nouveau compte Ooredoo Portal",
    html,
    attachments: [LOGO_ATTACHMENT]
  });
};

// ──────────────────────────────────────────────────────────────
// Envoi relance email pour UN ticket - vers les zone managers
// ──────────────────────────────────────────────────────────────
const sendAlertRelance = async ({ ticket, typeAlerte, messagePerso, expediteur, destinataires, managers }) => {
  const typeLabels = {
    rdv_non_pris: { label: '📅 RDV Non Répondu (48H)', couleur: '#F97316', icone: '📅' },
    en_cours_72h: { label: '⏱️ Activation En Cours +72H', couleur: '#E30613', icone: '⏱️' },
    gele: { label: '🧊 Activation Gelée', couleur: '#2563EB', icone: '🧊' }
  };
  const typeInfo = typeLabels[typeAlerte] || { label: `Alerte Ticket #${ticket.id}`, couleur: '#E30613', icone: '🔔' };

  const ticketTypeLabel = { activation: 'Activation', plainte: 'Plainte', resiliation: 'Résiliation' }[ticket.type_ticket] || ticket.type_ticket;
  const heures = Math.round((Date.now() - new Date(ticket.date_creation).getTime()) / 3600000);

  const messageAlerte = typeAlerte === 'rdv_non_pris'
    ? 'Merci de bien vouloir répondre au rendez-vous client et de renseigner la date de prise de RDV dans le système.'
    : typeAlerte === 'en_cours_72h'
    ? 'Merci de clôturer ce ticket si le statut d\'activation a été complété (date_prise_rdv, CRM case). Dans le cas contraire, veuillez mettre à jour le dossier.'
    : 'Merci de vérifier si cette activation est encore gelée ou si elle peut être traitée, et de mettre à jour le statut en conséquence.';

  const html = `
    <div style="max-width:650px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
      <!-- HEADER -->
      <div style="background-color:#E30613;padding:25px 30px;display:flex;align-items:center;justify-content:space-between;">
        <img src="cid:logo" width="140" alt="Ooredoo" style="display:block;">
        <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:8px 16px;">
          <span style="color:white;font-size:13px;font-weight:600;">ALERTE SYSTÈME</span>
        </div>
      </div>

      <!-- BADGE ALERTE -->
      <div style="background-color:${typeInfo.couleur};padding:15px 30px;text-align:center;">
        <span style="color:white;font-size:16px;font-weight:700;letter-spacing:0.5px;">${typeInfo.label}</span>
      </div>

      <!-- CORPS -->
      <div style="padding:35px 30px;background:#ffffff;">
        <p style="color:#333;font-size:15px;margin:0 0 20px 0;">
          Bonjour,<br><br>
          L'administration Ooredoo vous informe qu'un ticket nécessite votre attention urgente.
        </p>

        <!-- INFOS TICKET -->
        <div style="background:#f9f9f9;border:1px solid #eee;border-left:4px solid ${typeInfo.couleur};border-radius:8px;padding:20px;margin:20px 0;">
          <h3 style="margin:0 0 15px 0;color:${typeInfo.couleur};font-size:14px;text-transform:uppercase;letter-spacing:1px;">Détails du Ticket</h3>
          <table width="100%" cellspacing="0" cellpadding="6" style="font-size:14px;color:#555;">
            <tr>
              <td style="font-weight:600;color:#333;width:40%;">N° Ticket</td>
              <td><strong style="color:${typeInfo.couleur};">#${ticket.id}</strong></td>
            </tr>
            <tr style="background:#fff;">
              <td style="font-weight:600;color:#333;">Type</td>
              <td><span style="background:${typeInfo.couleur};color:white;padding:2px 10px;border-radius:20px;font-size:12px;">${ticketTypeLabel}</span></td>
            </tr>
            <tr>
              <td style="font-weight:600;color:#333;">Client</td>
              <td>${ticket.client_nom || 'N/A'} — ${ticket.client_tel || ''}</td>
            </tr>
            <tr style="background:#fff;">
              <td style="font-weight:600;color:#333;">Zone</td>
              <td>${ticket.zone || 'N/A'}</td>
            </tr>
            <tr>
              <td style="font-weight:600;color:#333;">Produit</td>
              <td>${ticket.produit || 'N/A'} ${ticket.debit ? '— ' + ticket.debit : ''}</td>
            </tr>
            <tr style="background:#fff;">
              <td style="font-weight:600;color:#333;">Statut</td>
              <td>${ticket.statut || 'N/A'}</td>
            </tr>
            <tr>
              <td style="font-weight:600;color:#333;">Créé le</td>
              <td>${new Date(ticket.date_creation).toLocaleDateString('fr-FR', {day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
            </tr>
            <tr style="background:#fff;">
              <td style="font-weight:600;color:#333;">Délai écoulé</td>
              <td><strong style="color:${heures >= 72 ? '#E30613' : '#F97316'};">${heures}H</strong></td>
            </tr>
            ${ticket.crm_case ? `<tr><td style="font-weight:600;color:#333;">CRM Case</td><td>${ticket.crm_case}</td></tr>` : ''}
            ${ticket.date_prise_rdv ? `<tr style="background:#fff;"><td style="font-weight:600;color:#333;">Date RDV</td><td>${new Date(ticket.date_prise_rdv).toLocaleDateString('fr-FR')}</td></tr>` : ''}
          </table>
        </div>

        <!-- MESSAGE D'ACTION -->
        <div style="background:#fff8f0;border:1px solid #F97316;border-radius:8px;padding:18px;margin:20px 0;">
          <p style="margin:0;color:#c2600a;font-size:14px;line-height:1.7;">
            <strong>⚠️ Action Requise :</strong><br>${messageAlerte}
          </p>
        </div>

        ${messagePerso ? `
        <div style="background:#f0f7ff;border:1px solid #2563EB;border-radius:8px;padding:18px;margin:20px 0;">
          <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.7;">
            <strong>💬 Message de l'administrateur :</strong><br>${messagePerso}
          </p>
        </div>` : ''}

        <!-- BOUTON RÉPONSE -->
        <div style="text-align:center;margin:30px 0;">
          <a href="mailto:${process.env.EMAIL_USER}?subject=RÉPONSE - Ticket #${ticket.id} (${ticketTypeLabel} / Zone ${ticket.zone})&body=Bonjour,%0A%0AEn réponse à l'alerte concernant le ticket #${ticket.id} :%0A%0A[Votre réponse ici]%0A%0ACordialement," 
             style="display:inline-block;background-color:${typeInfo.couleur};color:white;padding:14px 35px;text-decoration:none;border-radius:30px;font-weight:700;font-size:15px;letter-spacing:0.3px;">
            📧 Répondre à cette alerte
          </a>
        </div>

        <p style="color:#999;font-size:12px;text-align:center;margin-top:20px;">
          Cet email a été envoyé par <strong>${expediteur.prenom || ''} ${expediteur.nom || 'Administration'}</strong> via le Portail Ooredoo.
        </p>
      </div>

      <!-- FOOTER -->
      <div style="background:#f4f4f4;padding:18px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="margin:0;color:#999;font-size:11px;">© ${new Date().getFullYear()} Ooredoo Tunisie — Direction Technique<br>Fix Jdid — Portail de Gestion Interne</p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Ooredoo Alertes" <${process.env.EMAIL_USER}>`,
    to: destinataires.join(', '),
    replyTo: process.env.EMAIL_USER,
    subject: `🚨 [ALERTE] ${typeInfo.label} — Ticket #${ticket.id} | Zone ${ticket.zone} | ${ticketTypeLabel}`,
    html,
    attachments: [LOGO_ATTACHMENT]
  });
};

// ──────────────────────────────────────────────────────────────
// Envoi relance groupée - plusieurs tickets par zone
// ──────────────────────────────────────────────────────────────
const sendAlertRelanceGroupe = async ({ tickets, typeAlerte, messagePerso, expediteur, destinataires, zone }) => {
  const typeLabels = {
    rdv_non_pris: { label: '📅 RDV Non Répondu (48H)', couleur: '#F97316' },
    en_cours_72h: { label: '⏱️ Activations En Cours +72H', couleur: '#E30613' },
    gele: { label: '🧊 Activations Gelées', couleur: '#2563EB' }
  };
  const typeInfo = typeLabels[typeAlerte] || { label: 'Alertes Tickets', couleur: '#E30613' };

  const ticketRows = tickets.map(t => {
    const heures = Math.round((Date.now() - new Date(t.date_creation).getTime()) / 3600000);
    return `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;font-weight:600;color:${typeInfo.couleur};">#${t.id}</td>
        <td style="padding:10px 8px;">${t.client_nom || 'N/A'}</td>
        <td style="padding:10px 8px;">${t.produit || ''} ${t.debit || ''}</td>
        <td style="padding:10px 8px;"><strong style="color:${heures >= 72 ? '#E30613' : '#F97316'}">${heures}H</strong></td>
        <td style="padding:10px 8px;"><span style="background:${typeInfo.couleur};color:white;padding:2px 8px;border-radius:12px;font-size:11px;">${t.statut}</span></td>
      </tr>`;
  }).join('');

  const html = `
    <div style="max-width:700px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
      <div style="background-color:#E30613;padding:25px 30px;">
        <img src="cid:logo" width="140" alt="Ooredoo">
      </div>
      <div style="background:${typeInfo.couleur};padding:15px 30px;text-align:center;">
        <span style="color:white;font-size:16px;font-weight:700;">RELANCE GROUPÉE — Zone ${zone}</span>
      </div>
      <div style="padding:35px 30px;background:#fff;">
        <p style="color:#333;font-size:15px;">Bonjour,<br><br>Voici la liste des tickets nécessitant votre attention immédiate pour la zone <strong>${zone}</strong> :</p>
        <div style="overflow-x:auto;">
          <table width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:${typeInfo.couleur};color:white;">
                <th style="padding:12px 8px;text-align:left;">N°</th>
                <th style="padding:12px 8px;text-align:left;">Client</th>
                <th style="padding:12px 8px;text-align:left;">Produit</th>
                <th style="padding:12px 8px;text-align:left;">Délai</th>
                <th style="padding:12px 8px;text-align:left;">Statut</th>
              </tr>
            </thead>
            <tbody>${ticketRows}</tbody>
          </table>
        </div>
        ${messagePerso ? `<div style="background:#f0f7ff;border:1px solid #2563EB;border-radius:8px;padding:18px;margin:20px 0;"><p style="margin:0;color:#1e40af;font-size:14px;"><strong>💬 Message :</strong><br>${messagePerso}</p></div>` : ''}
        <div style="text-align:center;margin:30px 0;">
          <a href="mailto:${process.env.EMAIL_USER}?subject=RÉPONSE GROUPÉE - Zone ${zone}&body=Bonjour,%0A%0AEn réponse à la relance groupée pour la Zone ${zone} :%0A%0A[Votre réponse]%0A%0ACordialement,"
             style="display:inline-block;background:${typeInfo.couleur};color:white;padding:14px 35px;text-decoration:none;border-radius:30px;font-weight:700;font-size:15px;">
            📧 Répondre à cette relance
          </a>
        </div>
        <p style="color:#999;font-size:12px;text-align:center;">Envoyé par <strong>${expediteur.prenom || ''} ${expediteur.nom || 'Admin'}</strong> — Portail Ooredoo</p>
      </div>
      <div style="background:#f4f4f4;padding:18px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="margin:0;color:#999;font-size:11px;">© ${new Date().getFullYear()} Ooredoo Tunisie — Direction Technique</p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Ooredoo Alertes" <${process.env.EMAIL_USER}>`,
    to: destinataires.join(', '),
    replyTo: process.env.EMAIL_USER,
    subject: `🚨 [RELANCE GROUPÉE] ${typeInfo.label} — Zone ${zone} (${tickets.length} ticket(s))`,
    html,
    attachments: [LOGO_ATTACHMENT]
  });
};

module.exports = {
  sendOTPEmail,
  sendAdminRegistrationAlert,
  sendDailyReportEmail,
  sendNewPasswordEmail,
  sendAccountCreatedEmail,
  sendStatusEmail,
  sendAlertRelance,
  sendAlertRelanceGroupe
};
