import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Globe,
  Bell,
  LogOut,
  Settings,
  User as UserIcon,
  LayoutDashboard,
  Users,
  ScrollText,
  Menu,
  Download,
  Info,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import defaultAvatar from '../../assets/default-avatar.png';
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

  const [unreadCount, setUnreadCount] = useState(() => {
    const isRead = localStorage.getItem(`notifs_read_${user?.id}`);
    return isRead === 'true' ? 0 : 3;
  });

  const notifications = [
    { id: 1, type: 'info', icone: <Info size={16} color="#00BDF2" />, titre: "Bienvenue", texte: "Bienvenue sur le nouveau portail Ooredoo !", temps: "1h" },
    { id: 2, type: 'warning', icone: <AlertCircle size={16} color="#F26A36" />, titre: "Nouveau Ticket", texte: "Un nouveau ticket #4502 a été créé dans votre zone.", temps: "2h" },
    { id: 3, type: 'success', icone: <CheckCircle2 size={16} color="#62BB46" />, titre: "Rapport Prêt", texte: "Votre rapport d'activité mensuel est disponible.", temps: "5h" }
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
          <Menu size={24} />
        </button>

        <Link to={user ? "/dashboard" : "/"} className="navbar-logo-link">
          <img src="/ooredoo_logo.png" alt="Ooredoo" style={{ height: '50px', marginLeft: '16px' }} />
        </Link>
      </div>

      <div className="navbar-lang-switcher">
        <div className="custom-dropdown" onClick={() => setShowLangMenu(!showLangMenu)}>
          <button className="lang-btn">
            <Globe size={18} color="#00BDF2" />
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

      <div className="navbar-links desktop-only">
        {user ? (
          <>
            <NavLink to="/dashboard">
              <LayoutDashboard size={18} color="#00BDF2" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              {t('dashboard')}
            </NavLink>
            {user.role === 'admin' && (
              <>
                <NavLink to="/utilisateurs">
                  <Users size={18} color="#62BB46" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  {t('utilisateurs')}
                </NavLink>
                <NavLink to="/journalisation">
                  <ScrollText size={18} color="#171B60" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  {t('journalisation')}
                </NavLink>
              </>
            )}
            <NavLink to="/parametres">
              <Settings size={18} color="#3D5567" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              {t('parametres')}
            </NavLink>
          </>
        ) : (
          <Link to="/login" className="nav-login-link">
            <LogOut size={18} style={{ verticalAlign: 'middle', marginRight: '6px', transform: 'rotate(180deg)' }} />
            {t('se_connecter')}
          </Link>
        )}
      </div>

      {user && (
        <div className="navbar-user">
          <div className="notification-container">
            <button className={`btn-notification ${unreadCount > 0 ? 'anim-ring' : ''}`} onClick={handleNotifClick}>
              <Bell size={20} color="#FEBD3B" />
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

          <div className="navbar-pwa-install desktop-only">
            <button className="btn-pwa-nav" onClick={installApp} title="Installer l'application">
              <Download size={16} color="#8E5BA6" />
              <span className="pwa-text-btn">{t('installer') || 'Installer'}</span>
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
                <Link to={`/profil/${user.id}`} className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <UserIcon size={16} color="#CCB3D7" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  {t('mon_profil') || t('profil')}
                </Link>
                <Link to="/parametres" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <Settings size={16} color="#3D5567" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  {t('parametres')}
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item btn-logout" onClick={handleDeconnexion}>
                  <LogOut size={16} color="#F26A36" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  {t('deconnexion')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
