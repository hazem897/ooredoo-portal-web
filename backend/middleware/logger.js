const db = require('../config/db');

function actionLogger(req, res, next) {
  res.on('finish', () => {
    // Ne logguer que les actions de modification s'il y a un utilisateur authentifié
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && req.user && req.user.id) {
      // Ignorer /login et /logout qui sont gérés séparément
      if (req.originalUrl.includes('/api/auth/login') || req.originalUrl.includes('/api/auth/verify-otp') || req.originalUrl.includes('/api/auth/logout')) {
        return;
      }

      let description = `${req.method} sur ${req.originalUrl}`;
      
      // Personnalisation des messages d'action
      if (req.originalUrl.includes('/api/dashboard/tickets')) {
        if (req.method === 'POST') description = 'Création d\'un ticket';
        if (req.method === 'PUT') description = `Mise à jour statut d'un ticket`;
      } else if (req.originalUrl.includes('/api/users')) {
        if (req.method === 'PUT') description = 'Mise à jour d\'un utilisateur (Approbation/Refus)';
      }

      db.query('INSERT INTO access_logs (user_id, action) VALUES (?, ?)', [req.user.id, description], (err) => {
        if (err) console.error('Erreur Action Logger:', err);
      });
    }
  });
  next();
}

module.exports = actionLogger;
