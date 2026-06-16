// frontend/src/context/AuthContext.jsx - VERSION CORRIGÉE ET COMPLÈTE
import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('token');
  });

  // ✅ Connexion: Stocke token et user dans sessionStorage
  const connecter = (token, userData) => {
    console.log('[AUTH] Connexion réussie pour:', userData.email);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // ✅ Déconnexion: Supprime token et user
  const deconnecter = async (userId, reason = 'logout') => {
    console.log('[AUTH] Déconnexion pour:', user?.email);
    try {
      // ✅ CORRECTION: Utilise api.post() au lieu de fetch()
      await api.post('/auth/logout', { userId, reason });
    } catch (err) {
      console.error('[AUTH ERROR] Erreur logout:', err.message);
    }
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    connecter,
    deconnecter,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
