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
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ nom: '', prenom: '', email: '', role: 'manager', zone: '' });
  const [isAdding, setIsAdding] = useState(false);

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

  async function handleAddUser(e) {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await api.post('/users', newUserForm);
      setMessage(res.data.message);
      setShowAddModal(false);
      setNewUserForm({ nom: '', prenom: '', email: '', role: 'manager', zone: '' });
      chargerUsers();
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l'ajout");
    }
    setIsAdding(false);
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{t('gestion_utilisateurs')}</h1>
          <p>{t('demandes_acces_desc')}</p>
        </div>
        <button 
          className="btn-rouge" 
          onClick={() => setShowAddModal(true)}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--rouge)', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(227, 6, 19, 0.3)' }}
        >
          + Créer un compte
        </button>
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

      {showAddModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}>
          <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Créer un nouvel utilisateur</h2>
            <form onSubmit={handleAddUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600, color: '#555' }}>Nom</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    value={newUserForm.nom} onChange={e => setNewUserForm({...newUserForm, nom: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600, color: '#555' }}>Prénom</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    value={newUserForm.prenom} onChange={e => setNewUserForm({...newUserForm, prenom: e.target.value})} />
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600, color: '#555' }}>Email</label>
                <input type="email" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                  value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600, color: '#555' }}>Rôle</label>
                  <select required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value})}>
                    <option value="manager">Manager</option>
                    <option value="zone_manager">Zone Manager</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600, color: '#555' }}>Zone</label>
                  <select required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    value={newUserForm.zone} onChange={e => setNewUserForm({...newUserForm, zone: e.target.value})}>
                    <option value="">Choisir...</option>
                    {['Tunis Nord', 'Tunis Sud', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul', 'Monastir', 'Gafsa', 'Kairouan', 'Gabès'].map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontWeight: 600, color: '#333' }}>
                  Annuler
                </button>
                <button type="submit" disabled={isAdding} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: 'var(--rouge)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                  {isAdding ? 'Création...' : 'Créer et envoyer accès'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
