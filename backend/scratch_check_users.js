const db = require('./config/db');

db.query('SELECT id, nom, prenom, email, role, statut FROM users', (err, rows) => {
  if (err) {
    console.error('Error fetching users:', err.message);
    process.exit(1);
  }
  console.log('--- Users Status & Roles ---');
  rows.forEach(user => {
    console.log(`ID: ${user.id} | Name: ${user.nom} ${user.prenom} | Email: ${user.email} | Role: ${user.role} | Status: ${user.statut}`);
  });
  process.exit(0);
});
