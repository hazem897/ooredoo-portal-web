// backend/controllers/ticketController.js
const db = require('../config/db');
const xlsx = require('xlsx');
const path = require('path');

// ✅ CONSTANTS: Types de fichier acceptés
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel' // .xls
];

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

exports.importTickets = async (req, res) => {
  const { type } = req.params;
  const file = req.file;

  // ✅ Validation: Fichier présent
  if (!file) {
    return res.status(400).json({ message: 'Aucun fichier fourni' });
  }

  // ✅ Validation: Type de ticket
  if (!['activation', 'resiliation', 'plainte'].includes(type)) {
    return res.status(400).json({ message: 'Type de ticket invalide' });
  }

  // ✅ Validation: Extension du fichier
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return res.status(400).json({ 
      message: `Extension de fichier non autorisée. Accepté: ${ALLOWED_EXTENSIONS.join(', ')}` 
    });
  }

  // ✅ Validation: MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return res.status(400).json({ 
      message: 'Type MIME non autorisé. Veuillez télécharger un fichier Excel (.xlsx ou .xls)' 
    });
  }

  // ✅ Validation: Taille du fichier
  if (file.size > MAX_FILE_SIZE) {
    return res.status(400).json({ 
      message: `Fichier trop volumineux. Maximum: ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
    });
  }

  try {
    // ✅ Lecture du fichier Excel
    const workbook = xlsx.readFile(file.path);
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({ message: 'Le fichier Excel ne contient pas de feuille' });
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // ✅ Validation: Données présentes
    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'Le fichier Excel est vide' });
    }

    // ✅ Validation: Limite d'import (max 500 tickets par fichier)
    if (data.length > 500) {
      return res.status(400).json({ message: 'Trop de tickets. Maximum 500 par fichier.' });
    }

    // ✅ Préparation des données
    const values = data.map((row, index) => {
      // Valider les données requises
      if (!row.client_nom && !row.Client) {
        throw new Error(`Ligne ${index + 1}: Nom du client manquant`);
      }

      return [
        type,
        row.client_nom || row.Client || 'Inconnu',
        row.client_tel || row.Telephone || '',
        row.zone || row.Zone || '',
        row.produit || row.Produit || 'outdoor',
        row.debit || row.Debit || '',
        row.statut || row.Statut || 'ouvert',
        row.sla_cible || row.SLA || 48
      ];
    });

    // ✅ Insertion en base de données
    const sql = `INSERT INTO tickets (type_ticket, client_nom, client_tel, zone, produit, debit, statut, sla_cible) VALUES ?`;

    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error('[TICKET CONTROLLER] Erreur insertion tickets:', err.message);
        return res.status(500).json({ 
          message: 'Erreur lors de l\'insertion en base de données',
          error: process.env.DEV_MODE === 'true' ? err.message : undefined
        });
      }

      const insertedCount = result?.rowCount || values.length;
      console.log(`✅ ${insertedCount} tickets de type "${type}" importés avec succès`);
      
      res.json({ 
        message: `${insertedCount} tickets de type ${type} importés avec succès`,
        count: insertedCount
      });
    });

  } catch (error) {
    console.error('[TICKET CONTROLLER] Erreur traitement fichier:', error.message);
    res.status(400).json({ 
      message: `Erreur lors du traitement du fichier: ${error.message}`,
      error: process.env.DEV_MODE === 'true' ? error.message : undefined
    });
  }
};
