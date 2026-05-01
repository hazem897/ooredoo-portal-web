// backend/controllers/ticketController.js
const db = require('../config/db');
const xlsx = require('xlsx');

exports.importTickets = async (req, res) => {
  const { type } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Aucun fichier fourni' });
  }

  if (!['activation', 'resiliation', 'plainte'].includes(type)) {
    return res.status(400).json({ message: 'Type de ticket invalide' });
  }

  try {
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ message: 'Le fichier est vide' });
    }

    const values = data.map(row => [
      type,
      row.client_nom || row.Client || 'Inconnu',
      row.client_tel || row.Telephone || '',
      row.zone || row.Zone || '',
      row.produit || row.Produit || 'outdoor',
      row.debit || row.Debit || '',
      row.statut || row.Statut || 'ouvert',
      row.sla_cible || row.SLA || 48
    ]);

    const sql = `INSERT INTO tickets (type_ticket, client_nom, client_tel, zone, produit, debit, statut, sla_cible) VALUES ?`;

    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'import:', err);
        return res.status(500).json({ message: 'Erreur lors de l\'insertion en base de données' });
      }
      res.json({ message: `${result.affectedRows} tickets de type ${type} importés avec succès` });
    });

  } catch (error) {
    console.error('Erreur traitement fichier:', error);
    res.status(500).json({ message: 'Erreur lors du traitement du fichier' });
  }
};
