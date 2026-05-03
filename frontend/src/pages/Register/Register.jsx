// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
// Suppression import assets pour chemin public direct
import '../Login/Login.css';

const ZONES = ['Tunis Nord', 'Tunis Sud', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul', 'Monastir', 'Gafsa', 'Kairouan', 'Gabès'];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '',
    mot_de_passe: '', role: 'manager', zone: ''
  });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [chargement, setChargement] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur(''); setSucces('');
    if (form.mot_de_passe.length < 8) {
      return setErreur('Le mot de passe doit contenir au moins 8 caractères');
    }
    setChargement(true);
    try {
      const res = await api.post('/auth/register', form);
      setSucces(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de l'inscription");
    }
    setChargement(false);
  }

  return (
    <div className="login-page">
      <div className="login-gauche">
        <div className="login-deco">
          <img src="/ooredoo_logo.png" alt="Ooredoo Logo" style={{ height: '120px', borderRadius: '8px', zIndex: 10, position: 'relative' }} />
          <div className="deco-cercles">
            <div className="dc c1"></div>
            <div className="dc c2"></div>
          </div>
        </div>
      </div>

      <div className="login-droite">
        <div className="login-form-wrapper" style={{ maxWidth: 480 }}>
          <div className="mobile-logo-container">
            <img src="/ooredoo_logo.png" alt="Ooredoo Logo" />
          </div>
          <h2>Créer un compte</h2>
          <p className="login-sous-titre">Votre demande sera examinée par un administrateur</p>

          {erreur && <div className="alerte-erreur">{erreur}</div>}
          {succes && <div className="alerte-succes">{succes}<br /><small>Redirection dans 3s...</small></div>}

          {!succes && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="input-group">
                  <label>Nom</label>
                  <input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Prénom</label>
                  <input name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} required />
                </div>
              </div>
              <div className="input-group">
                <label>Email professionnel</label>
                <input name="email" type="email" placeholder="votre@email.tn"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Mot de passe</label>
                <input name="mot_de_passe" type="password" placeholder="Min. 8 caractères"
                  value={form.mot_de_passe} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn-rouge" style={{ width: '100%' }} disabled={chargement}>
                {chargement ? 'Envoi...' : 'Soumettre la demande'}
              </button>
            </form>
          )}

          <p className="login-footer">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
