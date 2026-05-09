const db = require('./config/db');

async function createMergedTable() {
  console.log('🏗️  Creating physical MERGED table...');
  
  try {
    const query = (sql, params) => new Promise((resolve, reject) => {
      db.query(sql, params, (err, res) => {
        if (err) reject(err); else resolve(res);
      });
    });

    // 1. Create the table
    await query(`DROP TABLE IF EXISTS merged`);
    await query(`
      CREATE TABLE merged (
        id INT AUTO_INCREMENT PRIMARY KEY,
        crm_case VARCHAR(100),
        client_nom VARCHAR(255),
        client_tel VARCHAR(50),
        zone VARCHAR(150),
        produit VARCHAR(255),
        debit VARCHAR(100),
        statut VARCHAR(100),
        statut_gel ENUM('oui', 'non') DEFAULT 'non',
        nb_relances INT DEFAULT 0,
        derniere_relance DATETIME,
        sla_cible FLOAT DEFAULT 48,
        sla_reel FLOAT DEFAULT 0,
        date_creation DATETIME,
        date_prise_rdv VARCHAR(100),
        date_fin_trv VARCHAR(100),
        commentaire TEXT,
        type_ticket VARCHAR(50)
      )
    `);

    console.log('🚚 Migrating data from activation, resiliation and plainte...');

    // 2. Insert data from the 3 source tables
    const tables = ['activation', 'resiliation', 'plainte'];
    for (const table of tables) {
      console.log(`   -> Copying ${table}...`);
      await query(`
        INSERT INTO merged 
        (crm_case, client_nom, client_tel, zone, produit, debit, statut, statut_gel, nb_relances, derniere_relance, sla_cible, sla_reel, date_creation, date_prise_rdv, date_fin_trv, commentaire, type_ticket)
        SELECT 
        crm_case, client_nom, client_tel, zone, produit, debit, statut, statut_gel, nb_relances, derniere_relance, sla_cible, sla_reel, date_creation, date_prise_rdv, date_fin_trv, commentaire, type_ticket
        FROM ${table}
      `);
    }

    // 3. Add Indexes for high performance
    console.log('⚡ Adding indexes for high performance...');
    await query(`CREATE INDEX idx_type ON merged(type_ticket)`);
    await query(`CREATE INDEX idx_zone ON merged(zone)`);
    await query(`CREATE INDEX idx_statut ON merged(statut)`);

    console.log('🌟 TABLE MERGED CREATED AND POPULATED SUCCESSFULLY!');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating merged table:', err);
    process.exit(1);
  }
}

createMergedTable();
