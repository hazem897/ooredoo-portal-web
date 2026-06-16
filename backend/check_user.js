const db = require('./config/db');

const email = 'hazemhazem9089@gmail.com';

db.query('SELECT id, email, mot_de_passe FROM users WHERE email = ?', [email], (err, rows) => {
  if (err) {
    console.error('DB ERROR:', err.message);
    process.exit(1);
  }
  if (!rows || rows.length === 0) {
    console.log('Utilisateur non trouvé');
    process.exit(0);
  }
  console.log('Utilisateur trouvé:');
  console.log(rows[0]);
  process.exit(0);
});
