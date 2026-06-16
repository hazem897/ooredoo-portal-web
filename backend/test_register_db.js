const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function test() {
  const hash = await bcrypt.hash('Password123!', 10);
  db.query(
    "INSERT INTO users (nom, prenom, email, mot_de_passe, role, zone, statut) VALUES (?, ?, ?, ?, ?, ?, 'en_attente')",
    ['TestNom', 'TestPrenom', 'testregister@example.com', hash, 'manager', 'Tunis Nord'],
    (err, rows) => {
      if (err) {
        console.error('INSERT ERROR:', err.message);
      } else {
        console.log('INSERT SUCCESS:', rows);
      }
      process.exit(0);
    }
  );
}
test();
