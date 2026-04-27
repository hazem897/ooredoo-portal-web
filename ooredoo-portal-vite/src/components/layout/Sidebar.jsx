import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePWA } from '../../hooks/usePWA';
import './Sidebar.css';

export default function Sidebar({ isOpen }) {
  const { user, deconnecter } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isInstallable, installApp } = usePWA();
  const [nbAttente, setNbAttente] = React.useState(0);

  React.useEffect(() => {
    if (user?.role === 'admin') {
      fetchNbAttente();
    }
  }, [user]);

  const fetchNbAttente = async () => {
    try {
      const res = await api.get('/users');
      const count = res.data.filter(u => u.statut === 'en_attente').length;
      setNbAttente(count);
    } catch (e) {}
  };

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
          <span>{t('dashboard')}</span>
        </NavLink>

        <NavLink
          to="/alertes"
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          <span className="icon">🚨</span>
          <span>Alertes &amp; Relances</span>
        </NavLink>

        {user.role === 'admin' && (
          <>
            <NavLink
              to="/utilisateurs"
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              <span className="icon">👥</span>
              <span>{t('utilisateurs')}</span>
              {nbAttente > 0 && <span className="badge-notif-side">{nbAttente}</span>}
            </NavLink>

            <NavLink
              to="/journalisation"
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              <span className="icon">📜</span>
              <span>{t('journalisation')}</span>
            </NavLink>
          </>
        )}

        <button className="sidebar-link sidebar-install-btn" onClick={handleInstall}>
          <span className="icon">📱</span>
          <span>{t('installer')}</span>
        </button>

        <NavLink
          to={`/profil/${user.id}`}
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          <span className="icon">👤</span>
          <span>{t('profil')}</span>
        </NavLink>

        <NavLink
          to="/parametres"
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          <span className="icon">⚙️</span>
          <span>{t('parametres')}</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <button className="btn-deconnexion-side" onClick={handleDeconnexion}>
          {t('deconnexion')}
        </button>
      </div>
    </aside>
  );
}
