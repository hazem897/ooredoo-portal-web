const db = require('./config/db');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const BASE_PATH = 'C:/Users/hp/Downloads/Compressed/Base_Final_TODO (2)/Base_Final_TODO/';

async function run() {
  console.log('🚀 Starting Data Import into 3 tables...');

  try {
    // 1. Redefine tables with a more complete schema
    const recreateTable = (name) => `
      CREATE TABLE IF NOT EXISTS ${name} (
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
        type_ticket VARCHAR(50) DEFAULT '${name}'

      )
    `;

    console.log('🧹 Cleaning old data and recreating tables...');
    await query('DROP TABLE IF EXISTS activation');
    await query('DROP TABLE IF EXISTS resiliation');
    await query('DROP TABLE IF EXISTS plainte');

    await query(recreateTable('activation'));
    await query(recreateTable('resiliation'));
    await query(recreateTable('plainte'));

    // 2. Import logic
    const importCSV = async (filename, tableName) => {
      const filePath = path.join(BASE_PATH, filename);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return;
      }

      console.log(`📦 Reading ${filename}...`);
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet, { defval: '' }); // Note: xlsx handles ';' if configured or if it's the default for CSV

      console.log(`💾 Inserting ${data.length} rows into ${tableName}...`);

      // Batch processing (1000 at a time)
      const batchSize = 1000;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const values = batch.map(row => [
          row.CRM_CASE || '',
          row.CLIENT || '',
          row.CONTACT_CLIENT || row.Contact_CL2 || '',
          row.GOUVERNORAT || row.ZONE_MANAGER || '',
          row.OFFRE || row.DES_PACK || '',
          row.Type_Offre_Speed || row.DEBIT_DL || '',
          row.STATUT || '',
          parseFloat(row.SLA_CRM) || 48,
          parseFloat(row.SLA_TECH) || 0,
          formatDate(row.DATE_CREATION_CRM || row.OPENING_DATE_SUR_TIMOS),
          row.DATE_PRISE_RDV || '',
          row.DATE_FIN_TRV || row.date_travaux_resiliation || '',
          row.COMMENTAIRE || row.description || ''
        ]);

        await query(`
          INSERT INTO ${tableName} 
          (crm_case, client_nom, client_tel, zone, produit, debit, statut, sla_cible, sla_reel, date_creation, date_prise_rdv, date_fin_trv, commentaire) 
          VALUES ?
        `, [values]);

        if (i % 5000 === 0) console.log(`   ... ${i} rows processed`);
      }
      console.log(`✅ ${tableName} imported.`);
    };

    await importCSV('act_clean.csv', 'activation');
    await importCSV('res_clean.csv', 'resiliation');
    await importCSV('plt_clean.csv', 'plainte');

    console.log('🌟 ALL DATA IMPORTED SUCCESSFULLY!');

  } catch (err) {
    console.error('❌ Error during import:', err);
  } finally {
    process.exit();
  }
}

function formatDate(val) {
  if (!val) return null;
  // Handle some common CSV date formats if needed
  return val;
}

function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

run();
