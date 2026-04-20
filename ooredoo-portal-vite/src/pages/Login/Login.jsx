// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { connecter } = useAuth();

  // Étape 1: saisie email/mdp | Étape 2: saisie OTP
  const [etape, setEtape] = useState(1);
  const [userId, setUserId] = useState(null);

  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [otp, setOtp] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  // Compteur OTP (120 secondes = 2 minutes)
  const [timeLeft, setTimeLeft] = useState(120);

  React.useEffect(() => {
    let timer;
    if (etape === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [etape, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // ÉTAPE 1 : Envoyer email + mot de passe
  async function handleLogin(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const res = await api.post('/auth/login', { email, mot_de_passe: mdp });
      setUserId(res.data.userId);
      setEtape(2);  // passer à l'étape OTP
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de connexion');
    }
    setChargement(false);
  }

  // ÉTAPE 2 : Vérifier le code OTP
  async function handleOTP(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp });
      connecter(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Code OTP incorrect');
    }
    setChargement(false);
  }

  // Renvoyer le code
  async function handleResend() {
    setErreur('');
    setChargement(true);
    try {
      await api.post('/auth/login', { email, mot_de_passe: mdp });
      setTimeLeft(120); // Réinitialiser le compteur à 2 minutes
      setOtp('');
      alert('Un nouveau code OTP a été envoyé à votre adresse email.');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du renvoi du code');
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
        <div className="login-form-wrapper">

          {etape === 1 ? (
            <>
              <h2>Connexion</h2>
              <p className="login-sous-titre">Accédez à votre espace de gestion</p>

              {erreur && <div className="alerte-erreur">{erreur}</div>}

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label>Email professionnel</label>
                  <input
                    type="email"
                    placeholder="votre@email.tn"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={mdp}
                    onChange={e => setMdp(e.target.value)}
                    required
                  />
                </div>
                <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                  <Link to="/forgot-password" title="Récupérer votre accès" className="forgot-password-link">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <button type="submit" className="btn-rouge" style={{ width: '100%' }} disabled={chargement}>
                  {chargement ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <p className="login-footer">
                Pas encore de compte ? <Link to="/register">Demander un accès</Link>
              </p>
            </>
          ) : (
            <>
              <div className="otp-icone">📧</div>
              <h2>Code de vérification</h2>
              <p className="login-sous-titre">
                Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
              </p>

              {erreur && <div className="alerte-erreur">{erreur}</div>}

              <form onSubmit={handleOTP}>
                <div className="input-group">
                  <label>Code OTP</label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="input-otp"
                    required
                  />
                </div>
                <button type="submit" className="btn-rouge" style={{ width: '100%' }} disabled={chargement || timeLeft === 0}>
                  {chargement ? 'Vérification...' : 'Valider le code'}
                </button>
              </form>

              <div className="otp-countdown" style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: timeLeft < 30 ? '#E30613' : '#666' }}>
                {timeLeft > 0 ? (
                  <p>Le code expire dans : <strong>{formatTime(timeLeft)}</strong></p>
                ) : (
                  <p style={{ fontWeight: 'bold' }}>Le code a expiré.</p>
                )}
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button 
                  className="btn-text" 
                  onClick={handleResend} 
                  disabled={chargement || timeLeft > 0} 
                  style={{ color: timeLeft === 0 ? '#E30613' : '#999', cursor: timeLeft === 0 ? 'pointer' : 'default', background: 'none', border: 'none', textDecoration: 'underline', fontSize: '14px' }}
                >
                  Renvoyer un nouveau code
                </button>
              </div>

              <button className="btn-retour" onClick={() => { setEtape(1); setErreur(''); setTimeLeft(120); }}>
                ← Retour
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
