const db = require('../config/db');
const bcrypt = require('bcryptjs');

const email = 'hazemhazem9089@gmail.com';
const newPassword = 'Hazoum1234#';
const hash = bcrypt.hashSync(newPassword, 10);

db.query(
  'UPDATE users SET mot_de_passe = ? WHERE email = ?',
  [hash, email],
  (err, result) => {
    if (err) {
      console.error('❌ Update failed:', err.message);
    } else {
      console.log('✅ Update succeeded:', result);
    }
    process.exit(0);
  }
);
