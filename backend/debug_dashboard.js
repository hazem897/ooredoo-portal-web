const db = require('./config/db');

const vTickets = `(
  SELECT 'activation' as type_ticket, id, crm_case, client_nom, client_tel, zone, produit, debit, statut, sla_cible, sla_reel, date_creation, date_prise_rdv, date_fin_trv FROM activation
  UNION ALL
  SELECT 'resiliation' as type_ticket, id, crm_case, client_nom, client_tel, zone, produit, debit, statut, sla_cible, sla_reel, date_creation, date_prise_rdv, date_fin_trv FROM resiliation
  UNION ALL
  SELECT 'plainte' as type_ticket, id, crm_case, client_nom, client_tel, zone, produit, debit, statut, sla_cible, sla_reel, date_creation, date_prise_rdv, date_fin_trv FROM plainte
) AS tickets`;

async function test() {
  console.log('Testing KPI query...');
  const sql = `
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(type_ticket = 'activation'), 0) AS activations,
        COALESCE(SUM(type_ticket = 'plainte'), 0) AS plaintes,
        COALESCE(SUM(type_ticket = 'resiliation'), 0) AS resiliations,
        COALESCE(SUM(statut = 'resolu'), 0) AS resolus,
        COALESCE(SUM(statut = 'ouvert' OR statut = 'en_cours'), 0) AS en_cours
      FROM ${vTickets}
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ SQL ERROR:', err);
    } else {
      console.log('✅ Success! Rows:', rows[0]);
    }
    process.exit();
  });
}

test();
