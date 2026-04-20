// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// Vérifie le token JWT dans le header Authorization
function verifierToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalide' });
  }
}

// Vérifie le rôle de l'utilisateur
function verifierRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  };
}

module.exports = { verifierToken, verifierRole };
