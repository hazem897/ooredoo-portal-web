const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifierToken, verifierRole } = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

const upload = multer({ dest: 'uploads/temp/' });

const ticketController = require('../controllers/ticketController');

// ──────────────────────────────────────────
// ROUTES TICKETS
// ──────────────────────────────────────────

// POST /api/tickets/import/:type
// Type peut être 'activation', 'resiliation' ou 'plainte'
router.post('/import/:type', verifierToken, verifierRole('admin'), upload.single('file'), ticketController.importTickets);

module.exports = router;
