const pool = require('./config/db');

// Modifier la colonne action pour accepter n'importe quel texte (plus seulement login/logout)
const query = `ALTER TABLE access_logs MODIFY COLUMN action VARCHAR(255) NOT NULL;`;

pool.query(query, (err) => {
    if (err) console.error("Error altering table:", err);
    else console.log("Table access_logs altered successfully");
    process.exit(err ? 1 : 0);
});
