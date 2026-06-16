const db = require('../config/db');

async function migrate() {
  const alterStatements = [
    "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS date_prise_rdv TIMESTAMP DEFAULT NULL;",
    "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS crm_case VARCHAR(100) DEFAULT NULL;",
    "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS statut_gel VARCHAR(10) DEFAULT 'non';",
    "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS derniere_relance TIMESTAMP DEFAULT NULL;",
    "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS nb_relances INT DEFAULT 0;"
  ];

  console.log('📌 Starting PG Alertes Migration...');

  for (const sql of alterStatements) {
    await new Promise((resolve) => {
      db.query(sql, (err, res) => {
        if (err) {
          console.error(`❌ Statement failed: ${sql}\nError: ${err.message}`);
        } else {
          console.log(`✅ Statement succeeded: ${sql.slice(0, 45)}...`);
        }
        resolve();
      });
    });
  }

  console.log('🎉 Migration completed successfully!');
  process.exit(0);
}

migrate();
