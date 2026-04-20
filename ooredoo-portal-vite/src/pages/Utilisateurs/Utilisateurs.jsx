// frontend/src/pages/Utilisateurs.js
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';
import './Utilisateurs.css';

export default function Utilisateurs() {
  const { t, lang } = useLanguage();
  const [users, setUsers] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('tous'); // tous | en_attente | approuve | refuse
  const [message, setMessage] = useState('');

  useEffect(() => {
    chargerUsers();
  }, []);

  async function chargerUsers() {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
    setChargement(false);
  }

  async function changerStatut(id, statut) {
    try {
      await api.put(`/users/${id}/approuver`, { statut });
      setMessage(`Utilisateur ${statut} avec succès`);
      chargerUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Erreur lors de la modification');
    }
  }

  async function supprimerUser(id, nom) {
    if (!window.confirm(`Supprimer l'utilisateur ${nom} ?`)) return;
    try {
      await api.delete(`/users/${id}`);
      setMessage('Utilisateur supprimé');
      chargerUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Erreur suppression');
    }
  }

  // Filtrer localement
  const usersFiltres = filtre === 'tous'
    ? users
    : users.filter(u => u.statut === filtre);

  // Compter par statut
  const nbAttente = users.filter(u => u.statut === 'en_attente').length;
  const nbApprouve = users.filter(u => u.statut === 'approuve').length;
  const nbRefuse = users.filter(u => u.statut === 'refuse').length;

  const badgeRole = (role) => {
    const classes = { admin: 'rouge', zone_manager: 'bleu', manager: 'vert' };
    return <span className={`badge badge-${classes[role]}`}>{role.replace('_', ' ')}</span>;
  };

  const badgeStatut = (statut) => {
    const map = { approuve: 'vert', en_attente: 'orange', refuse: 'rouge' };
    const labels = { approuve: t('approuves'), en_attente: t('en_attente'), refuse: t('refuses') };
    return <span className={`badge badge-${map[statut]}`}>{labels[statut]}</span>;
  };

  return (
    <div className="utilisateurs-page">
      <div className="page-header">
        <div>
          <h1>{t('gestion_utilisateurs')}</h1>
          <p>{t('demandes_acces_desc')}</p>
        </div>
      </div>

      {message && <div className="alerte-succes">{message}</div>}

      {/* Compteurs */}
      <div className="stats-users">
        <div className="stat-user-card total" onClick={() => setFiltre('tous')} style={{ cursor: 'pointer' }}>
          <span className="stat-val">{users.length}</span>
          <span className="stat-label">{t('total')}</span>
        </div>
        <div className="stat-user-card attente" onClick={() => setFiltre('en_attente')} style={{ cursor: 'pointer' }}>
          <span className="stat-val">{nbAttente}</span>
          <span className="stat-label">{t('en_attente')}</span>
          {nbAttente > 0 && <span className="notif-point"></span>}
        </div>
        <div className="stat-user-card approuve" onClick={() => setFiltre('approuve')} style={{ cursor: 'pointer' }}>
          <span className="stat-val">{nbApprouve}</span>
          <span className="stat-label">{t('approuves')}</span>
        </div>
        <div className="stat-user-card refuse" onClick={() => setFiltre('refuse')} style={{ cursor: 'pointer' }}>
          <span className="stat-val">{nbRefuse}</span>
          <span className="stat-label">{t('refuses')}</span>
        </div>
      </div>

      {/* Filtres */}
      <div className="filtres-tabs">
        {['tous', 'en_attente', 'approuve', 'refuse'].map(f => (
          <button
            key={f}
            className={`tab ${filtre === f ? 'actif' : ''}`}
            onClick={() => setFiltre(f)}
          >
            {f === 'tous' ? t('total') : f === 'en_attente' ? t('en_attente') : f === 'approuve' ? t('approuves') : t('refuses')}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="card">
        {chargement ? (
          <p style={{ textAlign: 'center', padding: '32px', color: 'var(--texte-clair)' }}>{t('chargement')}</p>
        ) : (
          <div className="tableau-container">
            <table>
              <thead>
                <tr>
                  <th>{t('utilisateurs')}</th>
                  <th>{t('email_pro')}</th>
                  <th>{t('col_role') || t('col_type')}</th>
                  <th>{t('col_zone')}</th>
                  <th>{t('col_statut')}</th>
                  <th>{t('col_date')}</th>
                  <th>{t('col_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {usersFiltres.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-avatar-nom">
                        <div className="avatar">
                          {u.prenom[0]}{u.nom[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{u.prenom} {u.nom}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--texte-clair)' }}>{u.email}</td>
                    <td>{badgeRole(u.role)}</td>
                    <td>{u.zone || '—'}</td>
                    <td>{badgeStatut(u.statut)}</td>
                    <td style={{ color: 'var(--texte-clair)', fontSize: '13px' }}>
                      {new Date(u.cree_le).toLocaleDateString(lang === 'ar' ? 'ar-TN' : 'fr-FR')}
                    </td>
                    <td>
                      <div className="actions-btns">
                        {u.statut === 'en_attente' && (
                          <>
                            <button className="btn-action approuver"
                              onClick={() => changerStatut(u.id, 'approuve')}>
                              ✓ {t('approuver')}
                            </button>
                            <button className="btn-action refuser"
                              onClick={() => changerStatut(u.id, 'refuse')}>
                              ✗ {t('refuser')}
                            </button>
                          </>
                        )}
                        {u.statut === 'approuve' && u.role !== 'admin' && (
                          <button className="btn-action refuser"
                            onClick={() => changerStatut(u.id, 'refuse')}>
                            {t('suspendre')}
                          </button>
                        )}
                        {u.statut === 'refuse' && (
                          <button className="btn-action approuver"
                            onClick={() => changerStatut(u.id, 'approuve')}>
                            {t('reactiver')}
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button className="btn-action supprimer"
                            onClick={() => supprimerUser(u.id, `${u.prenom} ${u.nom}`)}>
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usersFiltres.length === 0 && (
              <p style={{ textAlign: 'center', padding: '32px', color: 'var(--texte-clair)' }}>
                {t('aucun_utilisateur')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
