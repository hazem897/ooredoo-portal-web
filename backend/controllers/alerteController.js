// backend/controllers/alerteController.js
const db = require('../config/db');
const emailService = require('../services/emailService');

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

exports.getAlertes = async (req, res) => {
  const { role, zone } = req.user;
  const isAdmin = role === 'admin';
  const zoneParam = isAdmin ? [] : [zone || ''];
  const zoneWhere = isAdmin ? '' : 'AND t.zone = ?';

  try {
    const activations = await queryAsync(`
      SELECT t.id, t.client_nom, t.client_tel, t.zone, t.produit, t.debit,
             t.statut, t.date_creation, t.date_prise_rdv, t.crm_case,
             t.statut_gel, t.nb_relances, t.derniere_relance, t.type_ticket,
             EXTRACT(EPOCH FROM (NOW() - t.date_creation))::integer / 3600 AS heures_ecoulees
      FROM tickets t
      WHERE t.type_ticket = 'activation'
        AND t.statut NOT IN ('resolu', 'ferme')
        AND (
          (t.date_prise_rdv IS NULL AND t.date_creation <= NOW() - INTERVAL '48 hours')
          OR (t.statut = 'en_cours' AND t.date_creation <= NOW() - INTERVAL '72 hours')
          OR (t.statut_gel = 'oui')
        )
        ${zoneWhere}
      ORDER BY heures_ecoulees DESC
    `, [...zoneParam]);

    const resiliations = await queryAsync(`
      SELECT t.id, t.client_nom, t.client_tel, t.zone, t.produit, t.debit,
             t.statut, t.date_creation, t.date_prise_rdv, t.crm_case,
             t.statut_gel, t.nb_relances, t.derniere_relance, t.type_ticket,
             EXTRACT(EPOCH FROM (NOW() - t.date_creation))::integer / 3600 AS heures_ecoulees
      FROM tickets t
      WHERE t.type_ticket = 'resiliation'
        AND t.statut NOT IN ('resolu', 'ferme')
        AND t.date_creation <= NOW() - INTERVAL '48 hours'
        ${zoneWhere}
      ORDER BY heures_ecoulees DESC
    `, [...zoneParam]);

    const plaintes = await queryAsync(`
      SELECT t.id, t.client_nom, t.client_tel, t.zone, t.produit, t.debit,
             t.statut, t.date_creation, t.date_prise_rdv, t.crm_case,
             t.statut_gel, t.nb_relances, t.derniere_relance, t.type_ticket,
             EXTRACT(EPOCH FROM (NOW() - t.date_creation))::integer / 3600 AS heures_ecoulees
      FROM tickets t
      WHERE t.type_ticket = 'plainte'
        AND t.statut NOT IN ('resolu', 'ferme')
        AND t.date_creation <= NOW() - INTERVAL '48 hours'
        ${zoneWhere}
      ORDER BY heures_ecoulees DESC
    `, [...zoneParam]);

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
};

exports.envoyerRelance = async (req, res) => {
  const ticketId = req.params.id;
  const { typeAlerte, messagePerso } = req.body;
  const expediteur = req.user;

  try {
    const tickets = await queryAsync('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) return res.status(404).json({ message: 'Ticket introuvable' });
    const ticket = tickets[0];

    if (expediteur.role !== 'admin' && expediteur.zone !== ticket.zone) {
      return res.status(403).json({ message: 'Accès refusé : zone différente' });
    }

    let managersQuery = expediteur.role === 'admin'
      ? `SELECT email, prenom, nom, zone FROM users WHERE role IN ('zone_manager','manager') AND statut = 'approuve'`
      : `SELECT email, prenom, nom, zone FROM users WHERE role IN ('zone_manager','manager') AND zone = ? AND statut = 'approuve'`;
    
    const managers = await queryAsync(managersQuery, expediteur.role === 'admin' ? [] : [ticket.zone]);
    if (managers.length === 0) {
      managers.push({ email: process.env.EMAIL_USER || 'yessingsm4@gmail.com', prenom: 'Admin', nom: 'Ooredoo', zone: ticket.zone });
    }

    const destinataires = managers.map(m => m.email);

    await emailService.sendAlertRelance({
      ticket, typeAlerte, messagePerso, expediteur, destinataires, managers
    });

    await queryAsync('UPDATE tickets SET nb_relances = nb_relances + 1, derniere_relance = NOW() WHERE id = ?', [ticketId]);

    res.json({ message: `Relance envoyée à ${destinataires.length} destinataire(s)`, destinataires });
  } catch (err) {
    console.error('❌ Erreur envoi relance:', err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la relance', error: err.message });
  }
};

exports.envoyerRelanceGroupe = async (req, res) => {
  const { ticketIds, typeAlerte, messagePerso } = req.body;
  const expediteur = req.user;

  if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
    return res.status(400).json({ message: 'Aucun ticket sélectionné' });
  }

  try {
    const placeholders = ticketIds.map(() => '?').join(',');
    const tickets = await queryAsync(`SELECT * FROM tickets WHERE id IN (${placeholders})`, ticketIds);

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

      const destinataires = managers.length > 0 ? managers.map(m => m.email) : [process.env.EMAIL_USER || 'yessingsm4@gmail.com'];

      await emailService.sendAlertRelanceGroupe({
        tickets: ticketsZone, typeAlerte, messagePerso, expediteur, destinataires, zone
      });

      const placeholdersZone = ticketsZone.map(() => '?').join(',');
      const idsZone = ticketsZone.map(t => t.id);
      await queryAsync(`UPDATE tickets SET nb_relances = nb_relances + 1, derniere_relance = NOW() WHERE id IN (${placeholdersZone})`, idsZone);
      totalEnvoyes += destinataires.length;
    }

    res.json({ message: `Relances groupées envoyées (${totalEnvoyes} destinataire(s))` });
  } catch (err) {
    console.error('❌ Erreur relance groupée:', err);
    res.status(500).json({ message: 'Erreur relance groupée', error: err.message });
  }
};

exports.updateStatutGel = async (req, res) => {
  const { statut_gel } = req.body;
  if (!['oui', 'non'].includes(statut_gel)) return res.status(400).json({ message: 'Valeur invalide (oui/non)' });
  try {
    await queryAsync('UPDATE tickets SET statut_gel = ? WHERE id = ?', [statut_gel, req.params.id]);
    res.json({ message: `Statut gel mis à jour : ${statut_gel}` });
  } catch (err) {
    res.status(500).json({ message: 'Erreur mise à jour', error: err.message });
  }
};
