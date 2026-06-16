// backend/controllers/dashboardController.js
const db = require('../config/db');

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

exports.getStats = async (req, res) => {
  const { role, zone } = req.user;
  const isAdmin = role === 'admin';
  const zoneFiltre = zone || '';

  try {
    // ✅ Tickets KPIs - Requête paramétrée
    let ticketsKpisSQL = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE type_ticket = 'activation') AS activations,
        COUNT(*) FILTER (WHERE type_ticket = 'plainte') AS plaintes,
        COUNT(*) FILTER (WHERE type_ticket = 'resiliation') AS resiliations,
        COUNT(*) FILTER (WHERE statut = 'resolu') AS resolus,
        COUNT(*) FILTER (WHERE statut = 'ouvert' OR statut = 'en_cours') AS en_cours
      FROM tickets
    `;
    let ticketsKpisParams = [];
    
    if (!isAdmin) {
      ticketsKpisSQL += ' WHERE zone = ?';
      ticketsKpisParams.push(zoneFiltre);
    }

    const ticketsKpis = (await queryAsync(ticketsKpisSQL, ticketsKpisParams))[0];

    let usersEnAttente = 0;
    if (isAdmin) {
      const usersRes = await queryAsync(`SELECT COUNT(*) AS count FROM users WHERE statut = 'en_attente'`);
      usersEnAttente = usersRes[0]?.count || 0;
    }

    const kpis = { ...ticketsKpis, utilisateurs_en_attente: usersEnAttente };

    // ✅ SLA - Requête paramétrée
    let slaSQL = `
      SELECT
        type_ticket,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE sla_reel <= sla_cible) AS dans_sla,
        ROUND(AVG(sla_reel)::numeric, 1) AS moy_resolution,
        ROUND(AVG(sla_cible)::numeric, 1) AS moy_cible
      FROM tickets
      WHERE statut = 'resolu'
    `;
    let slaParams = [];
    
    if (!isAdmin) {
      slaSQL += ' AND zone = ?';
      slaParams.push(zoneFiltre);
    }
    
    slaSQL += ' GROUP BY type_ticket';
    const sla = await queryAsync(slaSQL, slaParams);

    // ✅ Par Produit - Requête paramétrée
    let parProduitSQL = `
      SELECT produit, COUNT(*) AS total,
        COUNT(*) FILTER (WHERE statut = 'resolu') AS resolus,
        ROUND(AVG(sla_reel)::numeric, 1) AS moy_sla
      FROM tickets
    `;
    let parProduitParams = [];
    
    if (!isAdmin) {
      parProduitSQL += ' WHERE zone = ?';
      parProduitParams.push(zoneFiltre);
    }
    
    parProduitSQL += ' GROUP BY produit';
    const parProduit = await queryAsync(parProduitSQL, parProduitParams);

    // ✅ Par Zone - Requête paramétrée
    let parZoneSQL = `
      SELECT zone, COUNT(*) AS total,
        COUNT(*) FILTER (WHERE type_ticket = 'plainte') AS plaintes,
        COUNT(*) FILTER (WHERE sla_reel <= sla_cible AND statut = 'resolu') AS dans_sla
      FROM tickets
    `;
    let parZoneParams = [];
    
    if (!isAdmin) {
      parZoneSQL += ' WHERE zone = ?';
      parZoneParams.push(zoneFiltre);
    }
    
    parZoneSQL += ' GROUP BY zone ORDER BY total DESC';
    const parZone = await queryAsync(parZoneSQL, parZoneParams);

    // ✅ Evolution - Requête paramétrée
    let evolutionSQL = `
      SELECT
        TO_CHAR(date_creation, 'YYYY-MM') AS mois,
        type_ticket,
        COUNT(*) AS total
      FROM tickets
      WHERE date_creation >= NOW() - INTERVAL '12 months'
    `;
    let evolutionParams = [];
    
    if (!isAdmin) {
      evolutionSQL += ' AND zone = ?';
      evolutionParams.push(zoneFiltre);
    }
    
    evolutionSQL += ' GROUP BY TO_CHAR(date_creation, \'YYYY-MM\'), type_ticket ORDER BY mois';
    const evolution = await queryAsync(evolutionSQL, evolutionParams);

    // ✅ Debits - Requête paramétrée
    let debitsSQL = `
      SELECT produit, debit, COUNT(*) AS total
      FROM tickets
    `;
    let debitsParams = [];
    
    if (!isAdmin) {
      debitsSQL += ' WHERE zone = ?';
      debitsParams.push(zoneFiltre);
    }
    
    debitsSQL += ' GROUP BY produit, debit ORDER BY produit, total DESC';
    const debits = await queryAsync(debitsSQL, debitsParams);

    res.json({ kpis, sla, parProduit, parZone, evolution, debits });
  } catch (err) {
    console.error('[DASHBOARD CONTROLLER] Erreur getStats:', err.message);
    res.status(500).json({ 
      message: 'Erreur chargement statistiques',
      error: process.env.DEV_MODE === 'true' ? err.message : undefined
    });
  }
};

exports.getTickets = (req, res) => {
  const { role, zone } = req.user;
  const { type, statut, produit } = req.query;

  // Valider les paramètres de query
  const validTypes = ['activation', 'plainte', 'resiliation'];
  const validStatuts = ['ouvert', 'en_cours', 'resolu', 'ferme'];
  const validProduits = ['outdoor', 'indoor', 'pro'];

  let where = [];
  let params = [];

  // ✅ Toujours filtrer par zone pour les non-admins
  if (role !== 'admin') {
    where.push('zone = ?');
    params.push(zone || '');
  }

  // ✅ Valider et ajouter les paramètres
  if (type && validTypes.includes(type)) {
    where.push('type_ticket = ?');
    params.push(type);
  }

  if (statut && validStatuts.includes(statut)) {
    where.push('statut = ?');
    params.push(statut);
  }

  if (produit && validProduits.includes(produit)) {
    where.push('produit = ?');
    params.push(produit);
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  db.query(
    `SELECT * FROM tickets ${whereClause} ORDER BY date_creation DESC LIMIT 100`,
    params,
    (err, rows) => {
      if (err) {
        console.error('[DASHBOARD CONTROLLER] Erreur getTickets:', err.message);
        return res.status(500).json({ message: 'Erreur lors du chargement des tickets' });
      }
      res.json(rows || []);
    }
  );
};
