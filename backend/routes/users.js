// backend/routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifierToken, verifierRole } = require('../middleware/auth');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Config Multer pour les photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/profiles';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });


const userController = require('../controllers/userController');

// ──────────────────────────────────────────
// ROUTES UTILISATEURS
// ──────────────────────────────────────────

// GET /api/users - Liste tous les utilisateurs (Admin seulement)
router.get('/', verifierToken, verifierRole('admin'), userController.getAllUsers);

// PUT /api/users/:id/approuver - Approuver/Refuser un user (Admin seulement)
router.put('/:id/approuver', verifierToken, verifierRole('admin'), userController.approuverUser);

// DELETE /api/users/:id - Supprimer un user (Admin seulement)
router.delete('/:id', verifierToken, verifierRole('admin'), userController.supprimerUser);

// GET /api/users/:id - Profil utilisateur
router.get('/:id', verifierToken, userController.getProfil);

// PUT /api/users/:id - Modifier infos profil
router.put('/:id', verifierToken, userController.modifierProfil);

// PUT /api/users/:id/password - Changer mdp
router.put('/:id/password', verifierToken, userController.changerMotDePasse);

// POST /api/users/:id/photo - Upload photo
router.post('/:id/photo', verifierToken, upload.single('photo'), userController.uploadPhoto);

module.exports = router;
