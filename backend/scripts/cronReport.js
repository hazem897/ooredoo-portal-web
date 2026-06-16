const cron = require('node-cron');
const db = require('./config/db');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit-table');
const fs = require('fs');
const path = require('path');

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Fonction pour générer et envoyer les rapports
const generateAndSendDailyReports = async () => {
  console.log('🕒 Démarrage de la génération du rapport quotidien (20:00)...');

  const query = `
    SELECT l.id, l.action, l.cree_le, u.nom, u.prenom, u.role, u.email
    FROM access_logs l
    JOIN users u ON l.user_id = u.id
    WHERE l.cree_le::date = CURRENT_DATE
    ORDER BY l.cree_le DESC
  `;

  db.query(query, async (err, logs) => {
    if (err) {
      console.error('❌ Erreur SQL lors de la génération du rapport:', err);
      return;
    }

    if (logs.length === 0) {
      console.log('ℹ️ Aucun log d\'accès pour aujourd\'hui. Envoi annulé.');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const reportsDir = path.join(__dirname, 'temp_reports');
      if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

      const baseName = `Rapport_Acces_Ooredoo_${today}`;

      // 1. Générer CSV
      const csvPath = path.join(reportsDir, `${baseName}.csv`);
      const csvHeader = 'ID,Utilisateur,Email,Role,Action,Date\n';
      const csvContent = logs.map(l => `${l.id},${l.nom} ${l.prenom},${l.email},${l.role},${l.action},${l.cree_le}`).join('\n');
      fs.writeFileSync(csvPath, csvHeader + csvContent);

      // 2. Générer Excel
      const excelPath = path.join(reportsDir, `${baseName}.xlsx`);
      const ws = XLSX.utils.json_to_sheet(logs.map(l => ({
        ID: l.id,
        Utilisateur: `${l.nom} ${l.prenom}`,
        Email: l.email,
        Role: l.role,
        Action: l.action,
        Date: l.cree_le
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Accès');
      XLSX.writeFile(wb, excelPath);

      // 3. Générer PDF
      const pdfPath = path.join(reportsDir, `${baseName}.pdf`);
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      doc.pipe(fs.createWriteStream(pdfPath));

      doc.fontSize(20).fillColor('#E30613').text('Rapport Quotidien des Accès Portal Ooredoo', { align: 'center' });
      doc.fontSize(12).fillColor('#333').text(`Date: ${today}`, { align: 'center' });
      doc.moveDown(2);

      const table = {
        title: "Détails des connexions et déconnexions",
        headers: ["ID", "Utilisateur", "Rôle", "Action", "Heure"],
        rows: logs.map(l => [
          l.id.toString(),
          `${l.nom} ${l.prenom}`,
          l.role,
          l.action,
          new Date(l.cree_le).toLocaleTimeString('fr-FR')
        ])
      };

      await doc.table(table, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: (row, i) => doc.font("Helvetica").fontSize(9)
      });

      doc.end();

      // Attendre un peu que le PDF finisse d'écrire
      setTimeout(async () => {
        // Envoi Email
        const mailOptions = {
          from: `"Système Ooredoo" <${process.env.EMAIL_USER}>`,
          to: 'yessingsm4@gmail.com', // Admin par défaut
          subject: `📊 Rapport d'Accès Ooredoo - ${today}`,
          html: `
            <div style="max-width: 600px; margin: 20px auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <!-- Header -->
                <div style="background-color: #E30613; padding: 30px; text-align: center;">
                    <img src="cid:logo" width="180" alt="Ooredoo">
                </div>
                
                <!-- Body -->
                <div style="padding: 40px; background-color: #ffffff;">
                    <h2 style="color: #333; margin-top: 0; font-size: 24px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">Rapport Quotidien d'Activité</h2>
                    
                    <p style="color: #666; line-height: 1.6; font-size: 16px;">Bonjour <strong style="color: #333;">Administrateur</strong>,</p>
                    
                    <p style="color: #666; line-height: 1.6; font-size: 16px;">
                        Le système a généré automatiquement le rapport de journalisation pour la journée du :
                        <br>
                        <span style="display: inline-block; background-color: #f8f9fa; padding: 8px 15px; border-radius: 6px; color: #E30613; font-weight: bold; margin-top: 10px; border: 1px solid #eee;">📅 ${today}</span>
                    </p>
            
                    <div style="background: linear-gradient(135deg, #E30613 0%, #ff4d4d 100%); padding: 20px; border-radius: 10px; color: white; margin: 30px 0; text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Nombre d'actions enregistrées</div>
                        <div style="font-size: 36px; font-weight: 800;">${logs.length}</div>
                    </div>
            
                    <p style="color: #666; line-height: 1.6; font-size: 15px;">
                        Vous trouverez en pièces jointes les détails complets au formats <strong>PDF</strong>, <strong>Excel (XLSX)</strong> et <strong>CSV</strong>.
                    </p>
                    
                    <div style="margin-top: 30px; padding: 20px; background-color: #fff8f8; border-left: 4px solid #E30613; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #888;">
                            <strong>Note :</strong> Pour des raisons de sécurité, ces fichiers contiennent des données sensibles. Veuillez les manipuler avec précaution.
                        </p>
                    </div>
                </div>
            
                <!-- Footer -->
                <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} Ooredoo Tunisia - Portail de Gestion Interne</p>
                    <p style="margin: 5px 0 0 0; color: #bbb; font-size: 11px;">Ceci est un message automatique, veuillez ne pas y répondre.</p>
                </div>
            </div>
          `,
          attachments: [
            { filename: 'logo.png', path: path.join(__dirname, 'assets/logo.png'), cid: 'logo' },
            { filename: `${baseName}.pdf`, path: pdfPath },
            { filename: `${baseName}.xlsx`, path: excelPath },
            { filename: `${baseName}.csv`, path: csvPath }
          ]
        };

        transporter.sendMail(mailOptions, (mailErr, info) => {
          if (mailErr) {
            console.error('❌ Erreur lors de l\'envoi du rapport par email:', mailErr);
          } else {
            console.log('✅ Rapport quotidien envoyé avec succès à l\'admin.');
            // Nettoyage des fichiers temporaires
            [pdfPath, excelPath, csvPath].forEach(p => fs.unlinkSync(p));
          }
        });
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur générale durant la génération du rapport:', error);
    }
  });
};

// Planification : Tous les jours à 20:00
cron.schedule('0 20 * * *', () => {
  generateAndSendDailyReports();
});

// Exporter pour pouvoir le démarrer au lancement du serveur et le tester manuellement
module.exports = { 
  init: () => console.log('🚀 Service de rapport automatique planifié à 20h00.'),
  generateAndSendDailyReports 
};
