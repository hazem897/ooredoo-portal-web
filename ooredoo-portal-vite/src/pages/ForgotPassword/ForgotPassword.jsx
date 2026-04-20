import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import '../Login/Login.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Password
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [chargement, setChargement] = useState(false);

  // Évaluation de la force du mot de passe (0-5)
  const evaluerForce = (pwd) => {
    if (!pwd) return { label: '', color: '#ddd', score: 0 };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const config = [
      { label: 'Très Risqué', color: '#ff4d4d', width: '20%' },
      { label: 'Faible', color: '#ff7700', width: '40%' },
      { label: 'Moyen', color: '#ffa500', width: '60%' },
      { label: 'Sécurisé', color: '#88cc00', width: '80%' },
      { label: 'Excellent', color: '#1A8A4E', width: '100%' }
    ];
    
    return score === 0 ? { label: 'Trop court', color: '#ff4d4d', width: '5%' } : config[score - 1];
  };

  const force = evaluerForce(newPassword);

  // Étape 1 : Demander le code
  const handleRequest = async (e) => {
    e.preventDefault();
    setChargement(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setStep(2);
      setMsg({ type: 'success', text: res.data.message });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'envoi.' });
    }
    setChargement(false);
  };

  // Étape 2 : Vérifier le code
  const handleVerify = async (e) => {
    e.preventDefault();
    setChargement(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post('/auth/verify-reset-otp', { 
        email: email.trim().toLowerCase(), 
        otp: otp.trim() 
      });
      setStep(3);
      setMsg({ type: 'success', text: 'Identité vérifiée. Saisissez votre nouveau mot de passe.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Code invalide ou expiré.' });
    }
    setChargement(false);
  };

  // Étape 3 : Nouveau mot de passe
  const handleReset = async (e) => {
    e.preventDefault();
    setChargement(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.post('/auth/reset-password', { 
        email: email.trim().toLowerCase(), 
        otp: otp.trim(), 
        newPassword 
      });
      setMsg({ type: 'success', text: 'Mot de passe réinitialisé avec succès ! Redirection en cours...' });
      setTimeout(() => window.location.href = '/login', 2500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la réinitialisation.' });
    }
    setChargement(false);
  };

  return (
    <div className="login-page">
      <div className="login-gauche">
        <div className="login-deco">
          <img src="/ooredoo_logo.png" alt="Ooredoo Logo" style={{ height: '120px', borderRadius: '8px', zIndex: 10, position: 'relative' }} />
          <div className="dc c1"></div>
          <div className="dc c2"></div>
        </div>
      </div>

      <div className="login-droite">
        <div className="login-form-wrapper">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
             <div className="otp-icone" style={{ background: '#f8f9fa', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)' }}>
               <span style={{ fontSize: '40px' }}>
                 {step === 1 ? '🤫' : step === 2 ? '📩' : '🛡️'}
               </span>
             </div>
          </div>

          <h2 style={{ textAlign: 'center', fontSize: '24px' }}>
            {step === 1 ? 'Récupération de compte' : 
             step === 2 ? 'Vérifier votre e-mail' : 
             'Sécuriser mon compte'}
          </h2>
          
          {msg.text && (
            <div className={`alerte-${msg.type === 'error' ? 'erreur' : 'succes'}`} style={{ margin: '20px 0', borderLeftWidth: '5px' }}>
              {msg.text}
            </div>
          )}

          {step === 1 && (
            <>
              <p className="login-sous-titre" style={{ textAlign: 'center' }}>
                Entrez votre e-mail professionnel pour recevoir un code de vérification sécurisé.
              </p>
              <form onSubmit={handleRequest} style={{ marginTop: '30px' }}>
                <div className="input-group">
                  <label>Email professionnel</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="votre@email.tn" 
                    required 
                  />
                </div>
                <button type="submit" className="btn-rouge" style={{ width: '100%', height: '50px', fontSize: '16px' }} disabled={chargement}>
                  {chargement ? 'Envoi en cours...' : 'Envoyer le code OTP'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <p className="login-sous-titre" style={{ textAlign: 'center' }}>
                Un code à 6 chiffres a été envoyé à :<br/>
                <strong style={{ color: 'var(--texte)' }}>{email}</strong>
              </p>
              <form onSubmit={handleVerify} style={{ marginTop: '30px' }}>
                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ margin: 0 }}>Code de vérification</label>
                    <span style={{ fontSize: '11px', color: '#E30613', fontWeight: 'bold' }}>Valide 10 min</span>
                  </div>
                  <input 
                    type="text" 
                    value={otp} 
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-otp"
                    placeholder="......" 
                    maxLength={6}
                    required 
                  />
                </div>
                <button type="submit" className="btn-rouge" style={{ width: '100%', height: '50px', fontSize: '16px' }} disabled={chargement}>
                  {chargement ? 'Vérification...' : 'Vérifier l\'identité'}
                </button>
                <button type="button" className="btn-retour" onClick={() => setStep(1)} style={{ width: '100%', textAlign: 'center', marginTop: '15px' }}>
                  ← Utiliser un autre email
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <p className="login-sous-titre" style={{ textAlign: 'center' }}>
                Désormais, choisissez un mot de passe que vous n'utilisez nulle part ailleurs.
              </p>
              <form onSubmit={handleReset} style={{ marginTop: '30px' }}>
                <div className="input-group">
                  <label>Nouveau mot de passe</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="••••••••••••" 
                    required 
                  />
                  
                  {newPassword && (
                    <div style={{ marginTop: '12px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#666' }}>Sécurité</span>
                        <span style={{ fontSize: '11px', color: force.color, fontWeight: 'bold' }}>{force.label}</span>
                      </div>
                      <div style={{ height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: force.width, 
                          background: force.color,
                          transition: 'width 0.4s ease-out'
                        }}></div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '15px', color: '#666', fontSize: '11px', lineHeight: '1.4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                      <span style={{ color: newPassword.length >= 8 ? '#1A8A4E' : '#ccc' }}>●</span> 8 caractères minimum
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? '#1A8A4E' : '#ccc' }}>●</span> Majuscule, Chiffre & Caractère spécial
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-rouge" style={{ width: '100%', height: '50px', fontSize: '16px' }} disabled={chargement || force.score < 3}>
                  {chargement ? 'Mise à jour...' : 'Finaliser la réinitialisation'}
                </button>
              </form>
            </>
          )}

          <p className="login-footer" style={{ marginTop: '30px' }}>
            <Link to="/login">← Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
