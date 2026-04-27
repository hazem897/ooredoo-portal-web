import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../utils/api';
import defaultAvatar from '../../assets/default-avatar.png';
import './Profil.css';

export default function Profil() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', zone: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [userLogs, setUserLogs] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;
      setErreur(null);
      try {
        const res = await api.get(`/users/${id}`);
        if (!res.data) throw new Error("Données de profil vides");
        setProfileData(res.data);
        setFormData({ 
          nom: res.data.nom || '', 
          prenom: res.data.prenom || '', 
          email: res.data.email || '',
          zone: res.data.zone || ''
        });

        // Charger aussi les logs de l'utilisateur
        const logsRes = await api.get(`/logs/user/${id}`);
        setUserLogs(logsRes.data || []);
      } catch (err) {
        console.error('Erreur API Profil:', err);
        setErreur(err.response?.data?.message || err.message || "Erreur de chargement du profil");
      }
    }
    fetchProfile();
  }, [id]);

  if (erreur) return <div className="erreur-container"><div className="card"><h3>❌ {t('erreur')}</h3><p>{erreur}</p><button className="btn-rouge" onClick={() => navigate('/dashboard')}>Retour au Dashboard</button></div></div>;
  if (!profileData) return <div className="chargement"><div className="spinner"></div><p>{t('chargement')}</p></div>;

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      await api.put(`/users/${id}`, formData);
      setMsg({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setProfileData({ ...profileData, ...formData });
      updateUser(formData);
    } catch (err) {
      setMsg({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    }
    setChargement(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return setMsg({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
    }
    setChargement(true);
    try {
      await api.put(`/users/${id}/password`, { password: passwords.new });
      setMsg({ type: 'success', text: 'Mot de passe modifié avec succès !' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Erreur lors du changement de mot de passe.' });
    }
    setChargement(false);
  };

  const handlePhotoClick = () => fileInputRef.current.click();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('photo', file);

    setChargement(true);
    try {
      const res = await api.post(`/users/${id}/photo`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileData({ ...profileData, photo_url: res.data.photoUrl });
      updateUser({ photo_url: res.data.photoUrl });
      setMsg({ type: 'success', text: 'Photo de profil mise à jour !' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Erreur lors de l\'envoi de la photo.' });
    }
    setChargement(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-TN' : 'fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const droitsRole = {
    'admin': t('droits_admin').split(', '),
    'manager': t('droits_manager').split(', '),
    'zone_manager': t('droits_zone').split(', ')
  };

  return (
    <div className="profil-page">
      <div className="profil-grid">
        
        {/* COLONNE GAUCHE : AVATAR ET RESUME */}
        <div className="profil-sidebar">
          <div className="card profile-main-card">
            <div className="avatar-wrapper" onClick={handlePhotoClick}>
              {profileData.photo_url ? (
                <img src={profileData.photo_url} alt="Profil" className="user-photo" />
              ) : (
                <img src={defaultAvatar} alt="Profil" className="user-photo fallback-image" />
              )}
              <div className="avatar-overlay">
                <span className="overlay-text">{t('changer_photo')}</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} accept="image/*" />
            
            <h3>{profileData.prenom} {profileData.nom}</h3>
            <span className={`badge-role ${profileData.role || ''}`}>{profileData.role ? profileData.role.replace('_', ' ') : ''}</span>
            <p className="since">{t('membre_depuis')} {profileData.cree_le ? formatDate(profileData.cree_le) : ''}</p>
          </div>

          <div className="card droits-card">
            <h4>{t('permissions_role')}</h4>
            <ul>
              {(droitsRole[profileData.role] || []).map((d, i) => <li key={i}>✅ {d}</li>)}
            </ul>
          </div>
        </div>

        {/* COLONNE DROITE : FORMULAIRES */}
        <div className="profil-main-content">
          {msg.text && <div className={`alert ${msg.type}`}>{msg.text}</div>}

          {/* FORMULAIRE INFOS */}
          <div className="card form-card">
            <h3>{t('modifier_infos')}</h3>
            <form onSubmit={handleUpdateInfo}>
              <div className="form-row">
                <div className="input-group">
                  <label>{t('prenom')}</label>
                  <input type="text" value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>{t('nom')}</label>
                  <input type="text" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} required />
                </div>
              </div>
              <div className="input-group">
                <label>{t('email_pro')}</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>{t('col_zone') || "Zone"}</label>
                <select value={formData.zone} onChange={e => setFormData({ ...formData, zone: e.target.value })}>
                  <option value="">Sélectionner une zone</option>
                  <option value="Tunis Nord">Tunis Nord</option>
                  <option value="Tunis Sud">Tunis Sud</option>
                  <option value="Sousse">Sousse</option>
                  <option value="Sfax">Sfax</option>
                  <option value="Bizerte">Bizerte</option>
                  <option value="Nabeul">Nabeul</option>
                  <option value="Gabès">Gabès</option>
                  <option value="Gafsa">Gafsa</option>
                </select>
              </div>
              <button type="submit" className="btn-rouge" disabled={chargement}>{t('enregistrer_modifs')}</button>
            </form>
          </div>

          {/* HISTORIQUE ACTIVITÉ */}
          <div className="card activity-card">
            <h3>📜 {t('journal_acces')} (Dernières actions)</h3>
            <div className="activity-list">
              {userLogs.length > 0 ? (
                userLogs.map(log => (
                  <div key={log.id} className="activity-item">
                    <div className="activity-icon">
                      {log.action === 'login' ? '🔑' : (log.action === 'logout' ? '🚪' : '⚡')}
                    </div>
                    <div className="activity-info">
                      <p className="activity-action">{log.action === 'login' ? t('connexion') : (log.action === 'logout' ? t('deconnexion') : log.action)}</p>
                      <span className="activity-date">{new Date(log.cree_le).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-msg">{t('aucun_historique')}</p>
              )}
            </div>
          </div>

          {/* FORMULAIRE MOT DE PASSE */}
          <div className="card form-card">
            <h3>{t('securite')} ({t('changement_mdp')})</h3>
            <form onSubmit={handleChangePassword}>
              <div className="input-group">
                <label>{t('nouveau_mdp')}</label>
                <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>{t('confirmer_mdp')}</label>
                <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} required />
              </div>
              <button type="submit" className="btn-noir" disabled={chargement}>{t('maj_mdp')}</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
