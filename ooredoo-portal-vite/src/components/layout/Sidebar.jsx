import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePWA } from '../../hooks/usePWA';
import './Sidebar.css';

export default function Sidebar({ isOpen }) {
  const { user, deconnecter } = useAuth();
  const navigate = useNavigate();
  const { isInstallable, installApp } = usePWA();

  if (!user) return null;

  const handleDeconnexion = () => {
    deconnecter();
    navigate('/login');
  };

  const handleInstall = () => {
    if (isInstallable) {
      installApp();
    } else {
      alert('Pour installer l\'application :\n\n• Chrome/Edge PC : Menu ⋮ → "Installer l\'application"\n• Chrome Mobile : Menu ⋮ → "Ajouter à l\'écran d\'accueil"\n• Safari iOS : Partager → "Sur l\'écran d\'accueil"');
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          <span className="icon">📊</span>
          <span>Tableau de bord</span>
        </NavLink>

        {user.role === 'admin' && (
          <>
            <NavLink
              to="/utilisateurs"
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              <span className="icon">👥</span>
              <span>Utilisateurs</span>
            </NavLink>

            <NavLink
              to="/journalisation"
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              <span className="icon">📜</span>
              <span>Journalisation</span>
            </NavLink>
          </>
        )}

        <button className="sidebar-link sidebar-install-btn" onClick={handleInstall}>
          <span className="icon">📱</span>
          <span>Installer l'app</span>
        </button>

        <NavLink
          to="/parametres"
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          <span className="icon">⚙️</span>
          <span>Paramètres</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <button className="btn-deconnexion-side" onClick={handleDeconnexion}>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
