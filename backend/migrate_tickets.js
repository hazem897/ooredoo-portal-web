const db = require('./config/db');

async function migrate() {
  console.log('🚀 Starting optimized migration to 3 tables...');

  try {
    // 1. Create tables
    const createTable = (name) => `
      CREATE TABLE IF NOT EXISTS ${name} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_nom VARCHAR(255),
        client_tel VARCHAR(20),
        zone VARCHAR(100),
        produit VARCHAR(100),
        debit VARCHAR(50),
        statut VARCHAR(50) DEFAULT 'ouvert',
        sla_cible INT DEFAULT 48,
        sla_reel FLOAT DEFAULT 0,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(createTable('activation'));
    await query(createTable('resiliation'));
    await query(createTable('plainte'));

    console.log('✅ Tables created.');

    // 2. Optimized migration using SQL SELECT INTO
    const tables = ['activation', 'resiliation', 'plainte'];
    for (const table of tables) {
      console.log(`📦 Migrating ${table}...`);
      await query(`
        INSERT INTO ${table} (client_nom, client_tel, zone, produit, debit, statut, sla_cible, sla_reel, date_creation)
        SELECT client_nom, client_tel, zone, produit, debit, statut, sla_cible, sla_reel, date_creation
        FROM tickets
        WHERE type_ticket = ?
      `, [table]);
    }
    
    console.log('✅ Data migrated.');

    // 3. Rename old table
    await query('RENAME TABLE tickets TO tickets_old');
    console.log('✅ Old table renamed to tickets_old.');

  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

migrate();
