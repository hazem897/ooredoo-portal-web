// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

// Utiliser un pool de connexions pour la reconnexion automatique
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Vérifier la connexion au démarrage (sans faire crasher le serveur)
pool.getConnection((err, connection) => {
  if (err) {
    console.error('⚠️  Impossible de se connecter à MySQL:', err.message);
    console.error('   Le serveur continue de tourner, mais les requêtes DB échoueront.');
    console.error('   Vérifiez que MySQL est démarré et que les credentials sont corrects.');
  } else {
    console.log('✅ Connecté à MySQL (pool)');
    connection.release();
  }
});

module.exports = pool;
