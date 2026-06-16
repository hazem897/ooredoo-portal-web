// backend/services/reportService.js
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit-table');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { sendDailyReportEmail } = require('./emailService');

const generateFiles = async (logs, today) => {
    const reportsDir = path.join(__dirname, '../temp_reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

    const baseName = `Rapport_Acces_Ooredoo_${today}`;
    const csvPath = path.join(reportsDir, `${baseName}.csv`);
    const excelPath = path.join(reportsDir, `${baseName}.xlsx`);
    const pdfPath = path.join(reportsDir, `${baseName}.pdf`);

    // CSV
    const csvContent = 'ID,Utilisateur,Email,Role,Action,Date\n' + 
      logs.map(l => `${l.id},${l.nom} ${l.prenom},${l.email},${l.role},${l.action},${l.cree_le}`).join('\n');
    fs.writeFileSync(csvPath, csvContent);

    // Excel
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

    // PDF
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);
    doc.fontSize(20).fillColor('#E30613').text('Rapport Quotidien des Accès Portal Ooredoo', { align: 'center' });
    doc.moveDown(2);
    
    await doc.table({
        headers: ["ID", "Utilisateur", "Rôle", "Action", "Heure"],
        rows: logs.map(l => [l.id.toString(), `${l.nom} ${l.prenom}`, l.role, l.action, new Date(l.cree_le).toLocaleTimeString('fr-FR')])
    }, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(9)
    });
    doc.end();

    return new Promise((resolve) => {
        pdfStream.on('finish', () => {
            resolve({
                paths: { pdf: pdfPath, excel: excelPath, csv: csvPath },
                attachments: [
                    { filename: `${baseName}.pdf`, path: pdfPath },
                    { filename: `${baseName}.xlsx`, path: excelPath },
                    { filename: `${baseName}.csv`, path: csvPath }
                ]
            });
        });
    });
};

const generateAndSendDailyReports = async () => {
    console.log('🕒 Démarrage de la génération du rapport quotidien...');
    const query = `
        SELECT l.id, l.action, l.cree_le, u.nom, u.prenom, u.role, u.email
        FROM access_logs l
        JOIN users u ON l.user_id = u.id
        WHERE l.cree_le::date = CURRENT_DATE
        ORDER BY l.cree_le DESC
    `;

    db.query(query, async (err, logs) => {
        if (err) return console.error('❌ Erreur SQL:', err);
        if (logs.length === 0) return console.log('ℹ️ Aucun log d\'accès pour aujourd\'hui. Envoi annulé.');

        try {
            const today = new Date().toISOString().split('T')[0];
            const { attachments, paths } = await generateFiles(logs, today);

            await sendDailyReportEmail(logs, attachments, today);
            console.log('✅ Rapport quotidien envoyé avec succès.');

            // Cleanup
            Object.values(paths).forEach(p => fs.unlinkSync(p));
        } catch (error) {
            console.error('❌ Erreur générale rapport:', error);
        }
    });
};

module.exports = { generateAndSendDailyReports };
