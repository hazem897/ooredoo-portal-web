/**
 * Utilitaires de validation pour l'application Ooredoo Portal
 */

// ✅ Validation du mot de passe fort
function validateStrongPassword(password) {
  if (!password) {
    return { valid: false, message: 'Le mot de passe est obligatoire' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)' };
  }

  return { valid: true, message: 'Mot de passe valide' };
}

// ✅ Validation de l'email
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ✅ Validation du nom
function validateName(name) {
  if (!name || name.trim().length < 2) {
    return false;
  }
  return !/[0-9!@#$%^&*(),.?":{}|<>]/.test(name);
}

// ✅ Validation du numéro de téléphone (format Tunisie)
function validatePhoneNumber(phone) {
  if (!phone) return false;
  const regex = /^(\+216|0)?[0-9]{8}$/;
  return regex.test(phone.replace(/\s|-/g, ''));
}

// ✅ Validation du rôle
function validateRole(role) {
  const validRoles = ['admin', 'zone_manager', 'manager', 'conseiller'];
  return validRoles.includes(role);
}

// ✅ Validation du type de ticket
function validateTicketType(type) {
  const validTypes = ['activation', 'plainte', 'resiliation'];
  return validTypes.includes(type);
}

// ✅ Validation du produit
function validateProduct(product) {
  const validProducts = ['outdoor', 'indoor', 'pro'];
  return validProducts.includes(product);
}

// ✅ Validation du statut de ticket
function validateTicketStatus(status) {
  const validStatuses = ['ouvert', 'en_cours', 'resolu', 'ferme'];
  return validStatuses.includes(status);
}

module.exports = {
  validateStrongPassword,
  validateEmail,
  validateName,
  validatePhoneNumber,
  validateRole,
  validateTicketType,
  validateProduct,
  validateTicketStatus
};
