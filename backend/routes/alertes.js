// backend/routes/alertes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifierToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ──────────────────────────────────────────────────────────────
// GET /api/alertes
// Retourne les 3 catégories d'alertes (filtré par zone si manager)
// ──────────────────────────────────────────────────────────────
router.get('/', verifierToken, async (req, res) => {
  const { role, zone } = req.user;
  const isAdmin = role === 'admin';
  const zoneParam = isAdmin ? [] : [zone || ''];
  const zoneWhere = isAdmin ? '' : 'AND t.zone = ?';

  try {
    // 1. ALERTES ACTIVATIONS (RDV non pris > 48h OR En cours > 72h OR Gelé)
    const activations = await queryAsync(`
      SELECT t.id, t.client_nom, t.client_tel, t.zone, t.produit, t.debit,
             t.statut, t.date_creation, t.date_prise_rdv, t.crm_case,
             t.statut_gel, t.nb_relances, t.derniere_relance, t.type_ticket,
             TIMESTAMPDIFF(HOUR, t.date_creation, NOW()) AS heures_ecoulees
      FROM tickets t
      WHERE t.type_ticket = 'activation'
        AND t.statut NOT IN ('resolu', 'ferme')
        AND (
          (t.date_prise_rdv IS NULL AND TIMESTAMPDIFF(HOUR, t.date_creation, NOW()) >= 48)
          OR (t.statut = 'en_cours' AND TIMESTAMPDIFF(HOUR, t.date_creation, NOW()) >= 72)
          OR (t.statut_gel = 'oui')
        )
        ${zoneWhere}
      ORDER BY heures_ecoulees DESC
    `, [...zoneParam]);

    // 2. ALERTES RÉSILIATIONS (Ouvert/En cours > 48h)
    const resiliations = await queryAsync(`
      SELECT t.id, t.client_nom, t.client_tel, t.zone, t.produit, t.debit,
             t.statut, t.date_creation, t.date_prise_rdv, t.crm_case,
             t.statut_gel, t.nb_relances, t.derniere_relance, t.type_ticket,
             TIMESTAMPDIFF(HOUR, t.date_creation, NOW()) AS heures_ecoulees
      FROM tickets t
      WHERE t.type_ticket = 'resiliation'
        AND t.statut NOT IN ('resolu', 'ferme')
        AND TIMESTAMPDIFF(HOUR, t.date_creation, NOW()) >= 48
        ${zoneWhere}
      ORDER BY heures_ecoulees DESC
    `, [...zoneParam]);

    // 3. ALERTES PLAINTES (Ouvert/En cours > 48h)
    const plaintes = await queryAsync(`
      SELECT t.id, t.client_nom, t.client_tel, t.zone, t.produit, t.debit,
             t.statut, t.date_creation, t.date_prise_rdv, t.crm_case,
             t.statut_gel, t.nb_relances, t.derniere_relance, t.type_ticket,
             TIMESTAMPDIFF(HOUR, t.date_creation, NOW()) AS heures_ecoulees
      FROM tickets t
      WHERE t.type_ticket = 'plainte'
        AND t.statut NOT IN ('resolu', 'ferme')
        AND TIMESTAMPDIFF(HOUR, t.date_creation, NOW()) >= 48
        ${zoneWhere}
      ORDER BY heures_ecoulees DESC
    `, [...zoneParam]);

    // Stats résumé
    const stats = {
      activations: activations.length,
      resiliations: resiliations.length,
      plaintes: plaintes.length,
      total: activations.length + resiliations.length + plaintes.length
    };

    res.json({ activations, resiliations, plaintes, stats });

  } catch (err) {
    console.error('❌ Erreur alertes:', err);
    res.status(500).json({ message: 'Erreur lors du chargement des alertes', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/alertes/:id/relance
// Envoie un email de relance aux zone managers pour un ticket
// ──────────────────────────────────────────────────────────────
router.post('/:id/relance', verifierToken, async (req, res) => {
  const ticketId = req.params.id;
  const { typeAlerte, messagePerso } = req.body;
  const expediteur = req.user;

  try {
    // 1. Récupérer le ticket
    const tickets = await queryAsync(
      'SELECT * FROM tickets WHERE id = ?', [ticketId]
    );
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket introuvable' });
    }
    const ticket = tickets[0];

    // 2. Vérifier accès (admin ou même zone)
    if (expediteur.role !== 'admin' && expediteur.zone !== ticket.zone) {
      return res.status(403).json({ message: 'Accès refusé : zone différente' });
    }

    // 3. Récupérer les Zone Managers de cette zone (ou tous si admin)
    let managersQuery = expediteur.role === 'admin'
      ? `SELECT email, prenom, nom, zone FROM users WHERE role IN ('zone_manager','manager') AND statut = 'approuve'`
      : `SELECT email, prenom, nom, zone FROM users WHERE role IN ('zone_manager','manager') AND zone = ? AND statut = 'approuve'`;
    
    const managers = await queryAsync(
      managersQuery,
      expediteur.role === 'admin' ? [] : [ticket.zone]
    );

    if (managers.length === 0) {
      // Envoyer quand même à l'admin
      managers.push({ email: process.env.EMAIL_USER || 'yessingsm4@gmail.com', prenom: 'Admin', nom: 'Ooredoo', zone: ticket.zone });
    }

    const destinataires = managers.map(m => m.email);

    // 4. Envoyer l'email
    await emailService.sendAlertRelance({
      ticket,
      typeAlerte,
      messagePerso,
      expediteur,
      destinataires,
      managers
    });

    // 5. Mettre à jour le ticket : incrémenter nb_relances + date
    await queryAsync(
      'UPDATE tickets SET nb_relances = nb_relances + 1, derniere_relance = NOW() WHERE id = ?',
      [ticketId]
    );

    res.json({ 
      message: `Relance envoyée à ${destinataires.length} destinataire(s)`,
      destinataires 
    });

  } catch (err) {
    console.error('❌ Erreur envoi relance:', err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la relance', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/alertes/relance-groupe
// Envoie une relance groupée pour plusieurs tickets
// ──────────────────────────────────────────────────────────────
router.post('/relance-groupe', verifierToken, async (req, res) => {
  const { ticketIds, typeAlerte, messagePerso } = req.body;
  const expediteur = req.user;

  if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
    return res.status(400).json({ message: 'Aucun ticket sélectionné' });
  }

  try {
    const placeholders = ticketIds.map(() => '?').join(',');
    const tickets = await queryAsync(
      `SELECT * FROM tickets WHERE id IN (${placeholders})`, ticketIds
    );

    // Grouper par zone
    const parZone = {};
    tickets.forEach(t => {
      if (!parZone[t.zone]) parZone[t.zone] = [];
      parZone[t.zone].push(t);
    });

    let totalEnvoyes = 0;

    for (const [zone, ticketsZone] of Object.entries(parZone)) {
      const managers = await queryAsync(
        `SELECT email, prenom, nom, zone FROM users WHERE role IN ('zone_manager','manager') AND zone = ? AND statut = 'approuve'`,
        [zone]
      );

      const destinataires = managers.length > 0 
        ? managers.map(m => m.email)
        : [process.env.EMAIL_USER || 'yessingsm4@gmail.com'];

      await emailService.sendAlertRelanceGroupe({
        tickets: ticketsZone,
        typeAlerte,
        messagePerso,
        expediteur,
        destinataires,
        zone
      });

      await queryAsync(
        `UPDATE tickets SET nb_relances = nb_relances + 1, derniere_relance = NOW() WHERE id IN (${placeholders})`,
        ticketIds
      );

      totalEnvoyes += destinataires.length;
    }

    res.json({ message: `Relances groupées envoyées (${totalEnvoyes} destinataire(s))` });

  } catch (err) {
    console.error('❌ Erreur relance groupée:', err);
    res.status(500).json({ message: 'Erreur relance groupée', error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// PUT /api/alertes/:id/statut-gel
// Mettre à jour le statut gel d'un ticket
// ──────────────────────────────────────────────────────────────
router.put('/:id/statut-gel', verifierToken, async (req, res) => {
  const { statut_gel } = req.body;
  if (!['oui', 'non'].includes(statut_gel)) {
    return res.status(400).json({ message: 'Valeur invalide (oui/non)' });
  }
  try {
    await queryAsync('UPDATE tickets SET statut_gel = ? WHERE id = ?', [statut_gel, req.params.id]);
    res.json({ message: `Statut gel mis à jour : ${statut_gel}` });
  } catch (err) {
    res.status(500).json({ message: 'Erreur mise à jour', error: err.message });
  }
});

module.exports = router;
