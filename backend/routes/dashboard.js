// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifierToken } = require('../middleware/auth');

// Helper: promisify db.query for async/await
function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ──────────────────────────────────────────
// GET /api/dashboard/stats
// Retourne toutes les stats pour le dashboard
// Filtre par zone si l'user est manager/zone_manager
// ──────────────────────────────────────────
router.get('/stats', verifierToken, async (req, res) => {
  const { role, zone } = req.user;
  const isAdmin = role === 'admin';
  const zoneFiltre = zone || '';

  // Build parameterized zone filters
  const filtreZoneWhere = isAdmin ? '' : 'WHERE zone = ?';
  const filtreZoneAnd   = isAdmin ? '' : 'AND zone = ?';
  const zoneParam       = isAdmin ? [] : [zoneFiltre];

  try {
    console.log(`📊 Chargement stats pour ${req.user.role} (${zoneFiltre})`);
    
    // 1. Compteurs globaux (KPIs)
    let kpis = {};
    try {
      const ticketsKpis = (await queryAsync(`
        SELECT
          COUNT(*) AS total,
          COALESCE(SUM(type_ticket = 'activation'), 0) AS activations,
          COALESCE(SUM(type_ticket = 'plainte'), 0) AS plaintes,
          COALESCE(SUM(type_ticket = 'resiliation'), 0) AS resiliations,
          COALESCE(SUM(statut = 'resolu'), 0) AS resolus,
          COALESCE(SUM(statut = 'ouvert' OR statut = 'en_cours'), 0) AS en_cours
        FROM tickets ${filtreZoneWhere}
      `, [...zoneParam]))[0];

      let usersEnAttente = 0;
      if (isAdmin) {
        const usersRes = await queryAsync(`SELECT COUNT(*) AS count FROM users WHERE statut = 'en_attente'`);
        usersEnAttente = usersRes[0].count;
      }

      kpis = { ...ticketsKpis, utilisateurs_en_attente: usersEnAttente };
    } catch (e) { console.error('❌ Erreur KPIs:', e.message); throw e; }

    // 2. SLA
    let sla = [];
    try {
      sla = await queryAsync(`
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
    } catch (e) { console.error('❌ Erreur SLA:', e.message); throw e; }

    // 3. Par produit
    let parProduit = [];
    try {
      parProduit = await queryAsync(`
        SELECT produit, COUNT(*) AS total,
          SUM(statut = 'resolu') AS resolus,
          ROUND(AVG(sla_reel), 1) AS moy_sla
        FROM tickets ${filtreZoneWhere}
        GROUP BY produit
      `, [...zoneParam]);
    } catch (e) { console.error('❌ Erreur Produits:', e.message); throw e; }

    // 4. Par zone
    let parZone = [];
    try {
      parZone = await queryAsync(`
        SELECT zone, COUNT(*) AS total,
          SUM(type_ticket = 'plainte') AS plaintes,
          SUM(sla_reel <= sla_cible AND statut = 'resolu') AS dans_sla
        FROM tickets ${filtreZoneWhere}
        GROUP BY zone
        ORDER BY total DESC
      `, [...zoneParam]);
    } catch (e) { console.error('❌ Erreur Zones:', e.message); throw e; }

    // 5. Évolution mensuelle
    let evolution = [];
    try {
      evolution = await queryAsync(`
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
    } catch (e) { console.error('❌ Erreur Évolution:', e.message); throw e; }

    // 6. Répartition débits
    let debits = [];
    try {
      debits = await queryAsync(`
        SELECT produit, debit, COUNT(*) AS total
        FROM tickets ${filtreZoneWhere}
        GROUP BY produit, debit
        ORDER BY produit, total DESC
      `, [...zoneParam]);
    } catch (e) { console.error('❌ Erreur Débits:', e.message); throw e; }

    res.json({ kpis, sla, parProduit, parZone, evolution, debits });

  } catch (err) {
    console.error('❌ GLOBAL DASHBOARD ERROR:', err);
    res.status(500).json({ message: 'Erreur lors du chargement des statistiques', error: err.message });
  }
});

// ──────────────────────────────────────────
// GET /api/dashboard/tickets
// Liste des tickets avec filtres
// ──────────────────────────────────────────
router.get('/tickets', verifierToken, (req, res) => {
  const { role, zone } = req.user;
  const { type, statut, produit } = req.query;

  let where = [];
  let params = [];

  if (role !== 'admin') { where.push('zone = ?'); params.push(zone || ''); }
  if (type) { where.push('type_ticket = ?'); params.push(type); }
  if (statut) { where.push('statut = ?'); params.push(statut); }
  if (produit) { where.push('produit = ?'); params.push(produit); }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  db.query(
    `SELECT * FROM tickets ${whereClause} ORDER BY date_creation DESC LIMIT 100`,
    params,
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erreur' });
      res.json(rows);
    }
  );
});

module.exports = router;
