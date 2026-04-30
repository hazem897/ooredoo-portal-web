import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import defaultAvatar from '../../assets/default-avatar.png';
// Suppression de l'import pour utiliser le chemin public direct
import { usePWA } from '../../hooks/usePWA';
import './Navbar.css';

function Navbar({ toggleSidebar }) {
  const { user, deconnecter } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const { isInstallable, installApp } = usePWA();
  const [showNotifs, setShowNotifs] = useState(false);




  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Utiliser localStorage pour que le badge reste masqué même après navigation
  const [unreadCount, setUnreadCount] = useState(() => {
    const isRead = localStorage.getItem(`notifs_read_${user?.id}`);
    return isRead === 'true' ? 0 : 3;
  });

  // Fausse liste de notifications (à remplacer par des données API si besoin)
  const notifications = [
    { id: 1, type: 'info', icone: '👋', titre: "Bienvenue", texte: "Bienvenue sur le nouveau portail Ooredoo !", temps: "1h" },
    { id: 2, type: 'warning', icone: '🎫', titre: "Nouveau Ticket", texte: "Un nouveau ticket #4502 a été créé dans votre zone.", temps: "2h" },
    { id: 3, type: 'success', icone: '📊', titre: "Rapport Prêt", texte: "Votre rapport d'activité mensuel est disponible.", temps: "5h" }
  ];

  const handleDeconnexion = () => {
    deconnecter();
    navigate('/login');
  };

  const handleNotifClick = () => {
    setShowNotifs(!showNotifs);
  };

  const marquerCommeLues = () => {
    setUnreadCount(0);
    localStorage.setItem(`notifs_read_${user?.id}`, 'true');
    setShowNotifs(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <button className="btn-hamburger" onClick={toggleSidebar}>
          ☰
        </button>

        <Link to={user ? "/dashboard" : "/"} className="navbar-logo-link">

          <img src="/ooredoo_logo.png" alt="Ooredoo" style={{ height: '50px', marginLeft: '16px' }} />
        </Link>
      </div>

      <div className="navbar-lang-switcher">
        <div className="custom-dropdown" onClick={() => setShowLangMenu(!showLangMenu)}>
          <button className="lang-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span className="lang-text">{lang.toUpperCase()}</span>
            <span className={`lang-arrow ${showLangMenu ? 'up' : 'down'}`}>▾</span>
          </button>

          {showLangMenu && (
            <div className="lang-dropdown-menu">
              <div className={`lang-item ${lang === 'fr' ? 'active' : ''}`} onClick={() => { setLang('fr'); setShowLangMenu(false); }}>
                Français
              </div>
              <div className={`lang-item ${lang === 'en' ? 'active' : ''}`} onClick={() => { setLang('en'); setShowLangMenu(false); }}>
                English
              </div>
              <div className={`lang-item ${lang === 'ar' ? 'active' : ''}`} onClick={() => { setLang('ar'); setShowLangMenu(false); }}>
                العربية
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-links">

        {user ? (
          <>
            <NavLink to="/dashboard">📊 {t('dashboard')}</NavLink>
            {user.role === 'admin' && (
              <>
                <NavLink to="/utilisateurs">👥 {t('utilisateurs')}</NavLink>
                <NavLink to="/journalisation">📜 {t('journalisation')}</NavLink>
              </>
            )}
            <NavLink to="/parametres">⚙️ {t('parametres')}</NavLink>
          </>
        ) : (
          <Link to="/login" className="nav-login-link">🔐 {t('se_connecter')}</Link>
        )}
      </div>

      {user && (
        <div className="navbar-user">
          <div className="notification-container">
            <button className={`btn-notification ${unreadCount > 0 ? 'anim-ring' : ''}`} onClick={handleNotifClick}>
              🔔
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {showNotifs && (
              <div className="notification-dropdown">
                <h4>{t('notifications')}</h4>
                <ul className={unreadCount > 0 ? 'has-unread' : ''}>
                  {notifications.map(notif => (
                    <li key={notif.id} className={`notif-item ${notif.type}`}>
                      <div className="notif-icon-circle">{notif.icone}</div>
                      <div className="notif-content">
                        <div className="notif-header-item">
                          <span className="notif-titre">{notif.titre}</span>
                          <span className="notif-time">{notif.temps}</span>
                        </div>
                        <p className="notif-text">{notif.texte}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="notif-footer">
                  <button onClick={marquerCommeLues} className="btn-mark-read">
                    {t('marquer_lues')}
                  </button>
                  <Link to="/notifications" className="btn-voir-tout" onClick={() => setShowNotifs(false)}>
                    {t('voir_tout') || "Voir tout"}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Bouton d'installation PWA (Mobile) - Toujours visible pour le confort */}
          <div className="navbar-pwa-install">
            <button className="btn-pwa-nav" onClick={installApp} title="Installer l'application">
              📲 <span className="pwa-text-btn">{t('installer') || 'Installer'}</span>
            </button>
          </div>

          <div className="user-dropdown-container">
            <div className="user-info-link" onClick={() => setShowUserMenu(!showUserMenu)} style={{ cursor: 'pointer' }}>
              <div className="navbar-avatar-wrapper">
                <img
                  key={user.photo_url || 'default'}
                  src={user.photo_url || defaultAvatar}
                  alt="Avatar"
                  className="navbar-avatar-img"
                  title={`${user.prenom} ${user.nom}`}
                />
              </div>
            </div>

            {showUserMenu && (
              <div className="user-dropdown-menu">
                <Link to={`/profil/${user.id}`} className="dropdown-item" onClick={() => setShowUserMenu(false)}>👤 {t('mon_profil') || t('profil')}</Link>
                <Link to="/parametres" className="dropdown-item" onClick={() => setShowUserMenu(false)}>⚙️ {t('parametres')}</Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item btn-logout" onClick={handleDeconnexion}>🚪 {t('deconnexion')}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
