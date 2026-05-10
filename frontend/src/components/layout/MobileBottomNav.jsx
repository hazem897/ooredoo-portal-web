import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Download, 
  Bell, 
  User,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePWA } from '../../hooks/usePWA';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const { isInstallable, installApp, isStandalone } = usePWA();

  if (!user) return null;

  return (
    <nav className="mobile-bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home className="nav-icon" size={20} color="#E30613" />
        <span className="nav-label">Accueil</span>
      </NavLink>

      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard className="nav-icon" size={20} color="#00BDF2" />
        <span className="nav-label">Stats</span>
      </NavLink>

      <NavLink to="/alertes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <AlertTriangle className="nav-icon" size={20} color="#F26A36" />
        <span className="nav-label">Alertes</span>
      </NavLink>

      {/* Bouton d'installation spécial pour Mobile */}
      {!isStandalone && isInstallable && (
        <button onClick={installApp} className="nav-item install-btn-mobile">
          <div className="install-icon-wrapper">
            <Download className="nav-icon" size={22} color="white" />
          </div>
          <span className="nav-label">Installer</span>
        </button>
      )}

      <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Bell className="nav-icon" size={20} color="#FEBD3B" />
        <span className="nav-label">Notifs</span>
      </NavLink>

      <NavLink to={`/profil/${user.id}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User className="nav-icon" size={20} color="#CCB3D7" />
        <span className="nav-label">Profil</span>
      </NavLink>
    </nav>
  );
}
