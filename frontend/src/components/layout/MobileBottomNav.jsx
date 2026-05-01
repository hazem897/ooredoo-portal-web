import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePWA } from '../../hooks/usePWA';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const { isInstallable, installApp, isStandalone } = usePWA();

  if (!user) return null;

  return (
    <nav className="mobile-bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">📊</span>
        <span className="nav-label">Stats</span>
      </NavLink>

      <NavLink to="/alertes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">⚠️</span>
        <span className="nav-label">Alertes</span>
      </NavLink>

      {/* Bouton d'installation spécial pour Mobile */}
      {!isStandalone && isInstallable && (
        <button onClick={installApp} className="nav-item install-btn-mobile">
          <div className="install-icon-wrapper">
            <span className="nav-icon">📲</span>
          </div>
          <span className="nav-label">Installer</span>
        </button>
      )}

      <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">🔔</span>
        <span className="nav-label">Notifs</span>
      </NavLink>

      <NavLink to={`/profil/${user.id}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">👤</span>
        <span className="nav-label">Profil</span>
      </NavLink>
    </nav>
  );
}
