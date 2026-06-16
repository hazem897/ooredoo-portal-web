// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [chargement, setChargement] = useState(true);

  // Au démarrage, récupérer les données sauvegardées
  useEffect(() => {
    try {
      const tokenSauve = sessionStorage.getItem('token');
      const userSauve = sessionStorage.getItem('user');
      if (tokenSauve && userSauve) {
        setToken(tokenSauve);
        setUser(JSON.parse(userSauve));
      }
    } catch (e) {
      console.error("Erreur de récupération de session:", e);
      sessionStorage.clear();
    } finally {
      setChargement(false);
    }
  }, []);

  // Mettre à jour le favicon avec la photo de profil
  useEffect(() => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      if (user?.photo_url) {
        favicon.href = user.photo_url;
      } else {
        favicon.href = '/ooredoo_icon.png';
      }
    }
  }, [user]);

  // Connexion : sauvegarder token et user
  function connecter(token, userData) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  }

  // Déconnexion
  async function deconnecter(reason = 'logout') {
    if (user) {
      try {
        await api.post('/auth/logout', { userId: user.id, reason });
      } catch (err) {
        console.error('Erreur lors du log de déconnexion', err);
      }
    }
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  // Mécanisme de Session Timeout (Inactivité)
  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (token) {
        timeoutId = setTimeout(() => {
          console.warn("Session expirée pour inactivité");
          deconnecter('timeout');
          alert("Votre session a expiré suite à une inactivité prolongée. Veuillez vous reconnecter.");
        }, 30 * 60 * 1000); // 30 minutes
      }
    };

    if (token) {
      const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      
      resetTimer(); // Lancer le timer au montage si déjà connecté
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        events.forEach(event => window.removeEventListener(event, resetTimer));
      };
    }
  }, [token]);

  // Mettre à jour les données du user manuellement
  function updateUser(newData) {
    const updatedUser = { ...user, ...newData };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, token, connecter, deconnecter, updateUser, chargement }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
