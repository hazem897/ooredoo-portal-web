const crypto = require('crypto');

/**
 * Génère un mot de passe fort aléatoire
 * @param {number} length Longueur du mot de passe
 * @returns {string} Le mot de passe généré
 */
function generateStrongPassword(length = 14) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%&*"; // Caractères spéciaux classiques et lisibles
  const all = upper + lower + numbers + special;

  let arr = [];
  arr.push(upper[crypto.randomInt(0, upper.length)]);
  arr.push(lower[crypto.randomInt(0, lower.length)]);
  arr.push(numbers[crypto.randomInt(0, numbers.length)]);
  arr.push(special[crypto.randomInt(0, special.length)]);

  for (let i = 4; i < length; i++) {
    arr.push(all[crypto.randomInt(0, all.length)]);
  }

  // Mélange de Fisher-Yates pour une distribution aléatoire parfaite
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
}

module.exports = { generateStrongPassword };
