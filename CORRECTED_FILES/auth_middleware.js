// backend/middleware/auth.js - MIDDLEWARE DE VÉRIFICATION JWT
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('[AUTH MIDDLEWARE] Token valide pour utilisateur:', decoded.email);
    next();
  } catch (err) {
    console.warn('[AUTH MIDDLEWARE] Token invalide:', err.message);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

exports.verifyRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      console.warn('[AUTH MIDDLEWARE] Accès refusé pour rôle:', req.user.role);
      return res.status(403).json({ message: 'Accès refusé' });
    }

    next();
  };
};
