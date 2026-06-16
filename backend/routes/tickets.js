const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifierToken, verifierRole } = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// ✅ Configuration Multer avec restrictions
const ticketUploadDir = 'uploads/temp/';
if (!fs.existsSync(ticketUploadDir)) {
  fs.mkdirSync(ticketUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ticketUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `tickets-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // ✅ Valider le MIME type
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Seuls les fichiers Excel (.xlsx, .xls) sont acceptés'));
    }

    // ✅ Valider l'extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.xlsx', '.xls'].includes(ext)) {
      return cb(new Error('Extension de fichier non autorisée'));
    }

    cb(null, true);
  }
});

const ticketController = require('../controllers/ticketController');

// ──────────────────────────────────────────
// ROUTES TICKETS
// ──────────────────────────────────────────

// POST /api/tickets/import/:type
// Type peut être 'activation', 'resiliation' ou 'plainte'
router.post('/import/:type', verifierToken, verifierRole('admin'), upload.single('file'), ticketController.importTickets);

module.exports = router;
