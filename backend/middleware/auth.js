// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// Vérifie le token JWT dans le header Authorization
function verifierToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    console.warn('[AUTH MIDDLEWARE] Token manquant - Pas d\'header Authorization');
    return res.status(401).json({ message: 'Token manquant. Veuillez vous reconnecter.' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    console.warn('[AUTH MIDDLEWARE] Token manquant - Format invalide de Authorization header');
    return res.status(401).json({ message: 'Format de token invalide' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email, nom, prenom, zone }
    console.log(`[AUTH MIDDLEWARE] ✅ Token valide pour user: ${decoded.email} (${decoded.role})`);
    next();
  } catch (err) {
    console.warn(`[AUTH MIDDLEWARE] ❌ Token invalide: ${err.message}`);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Votre session a expir\u00e9. Veuillez vous reconnecter.' });
    }
    return res.status(401).json({ message: 'Token invalide ou expir\u00e9' });
  }
}

// Vérifie le rôle de l'utilisateur
function verifierRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      console.warn('[AUTH MIDDLEWARE] User non d\u00e9fini');
      return res.status(401).json({ message: 'Utilisateur non authentifi\u00e9' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.warn(`[AUTH MIDDLEWARE] Acc\u00e8s refus\u00e9 - user role: ${req.user.role}, required roles: ${roles.join(', ')}`);
      return res.status(403).json({ message: 'Acc\u00e8s refus\u00e9. Vous n\'avez pas les permissions n\u00e9cessaires.' });
    }
    
    console.log(`[AUTH MIDDLEWARE] ✅ R\u00f4le ${req.user.role} autoris\u00e9`);
    next();
  };
}

module.exports = { verifierToken, verifierRole };
