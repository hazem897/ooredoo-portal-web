const db = require('../config/db');

db.query('SELECT id, nom, prenom, email, role, statut, cree_le FROM users ORDER BY cree_le DESC', (err, rows) => {
  if (err) {
    console.error('DB ERROR:', err.message);
    process.exit(1);
  }
  console.log('--- ALL USERS IN DB ---');
  console.log(rows);
  process.exit(0);
});
