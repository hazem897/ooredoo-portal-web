const db = require('./config/db');

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function testDashboard() {
  try {
    const zoneParam = [];
    const filtreZoneWhere = '';
    const filtreZoneAnd = '';

    console.log('1. Testing KPI query...');
    const kpis = await queryAsync(`
      SELECT
        COUNT(*) AS total,
        SUM(type_ticket = 'activation') AS activations,
        SUM(type_ticket = 'plainte') AS plaintes,
        SUM(type_ticket = 'resiliation') AS resiliations,
        SUM(statut = 'resolu') AS resolus,
        SUM(statut = 'ouvert' OR statut = 'en_cours') AS en_cours
      FROM tickets ${filtreZoneWhere}
    `, [...zoneParam]);
    console.log('KPIs:', kpis[0]);

    console.log('2. Testing SLA query...');
    const sla = await queryAsync(`
      SELECT
        type_ticket,
        COUNT(*) AS total,
        SUM(sla_reel <= sla_cible) AS dans_sla,
        ROUND(AVG(sla_reel), 1) AS moy_resolution,
        ROUND(AVG(sla_cible), 1) AS moy_cible
      FROM tickets
      WHERE statut = 'resolu' ${filtreZoneAnd}
      GROUP BY type_ticket
    `, [...zoneParam]);
    console.log('SLA Count:', sla.length);

    console.log('3. Testing parProduit query...');
    const parProduit = await queryAsync(`
      SELECT produit, COUNT(*) AS total,
        SUM(statut = 'resolu') AS resolus,
        ROUND(AVG(sla_reel), 1) AS moy_sla
      FROM tickets ${filtreZoneWhere}
      GROUP BY produit
    `, [...zoneParam]);
    console.log('parProduit Count:', parProduit.length);

    console.log('4. Testing parZone query...');
    const parZone = await queryAsync(`
      SELECT zone, COUNT(*) AS total,
        SUM(type_ticket = 'plainte') AS plaintes,
        SUM(sla_reel <= sla_cible AND statut = 'resolu') AS dans_sla
      FROM tickets ${filtreZoneWhere}
      GROUP BY zone
      ORDER BY total DESC
    `, [...zoneParam]);
    console.log('parZone Count:', parZone.length);

    console.log('5. Testing evolution query...');
    const evolution = await queryAsync(`
      SELECT
        DATE_FORMAT(date_creation, '%Y-%m') AS mois,
        type_ticket,
        COUNT(*) AS total
      FROM tickets
      WHERE date_creation >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      ${filtreZoneAnd}
      GROUP BY mois, type_ticket
      ORDER BY mois
    `, [...zoneParam]);
    console.log('Evolution Count:', evolution.length);

    console.log('6. Testing debits query...');
    const debits = await queryAsync(`
      SELECT produit, debit, COUNT(*) AS total
      FROM tickets ${filtreZoneWhere}
      GROUP BY produit, debit
      ORDER BY produit, total DESC
    `, [...zoneParam]);
    console.log('Debits Count:', debits.length);

    console.log('✅ ALL QUERIES PASSED');
    process.exit(0);
  } catch (err) {
    console.error('❌ FAILED:', err);
    process.exit(1);
  }
}

testDashboard();
