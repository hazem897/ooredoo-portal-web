const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔍 Test de connexion à PostgreSQL...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'MISSING');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur de connexion:', err.message);
    console.error('Code:', err.code);
    process.exit(1);
  }
  
  console.log('✅ Connexion réussie!');
  
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      console.error('❌ Erreur de requête:', err.message);
      process.exit(1);
    }
    
    console.log('✅ Requête réussie:', result.rows[0]);
    pool.end(() => {
      console.log('✅ Pool fermé');
      process.exit(0);
    });
  });
});

pool.on('error', (err) => {
  console.error('❌ Erreur pool:', err);
});
