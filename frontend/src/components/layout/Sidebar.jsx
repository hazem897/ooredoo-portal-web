import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Bell, 
  Users, 
  ScrollText, 
  Smartphone, 
  Settings,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePWA } from '../../hooks/usePWA';
import api from '../../utils/api';
import defaultAvatar from '../../assets/default-avatar.png';
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
      alert('Installation "un clic" indisponible :\n\n• Vérifiez que vous êtes sur Chrome\n• Ou utilisez le Menu ⋮ de Chrome → "Ajouter à l\'écran d\'accueil"');
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          <LayoutDashboard className="icon" size={20} color="#00BDF2" />
          <span>{t('dashboard')}</span>
        </NavLink>

        <NavLink
          to="/alertes"
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          <AlertTriangle className="icon" size={20} color="#F26A36" />
          <span>Alertes &amp; Relances</span>
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          <Bell className="icon" size={20} color="#FEBD3B" />
          <span>{t('notifications')}</span>
        </NavLink>

        {user.role === 'admin' && (
          <>
            <NavLink
              to="/utilisateurs"
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              <Users className="icon" size={20} color="#62BB46" />
              <span>{t('utilisateurs')}</span>
              {nbAttente > 0 && <span className="badge-notif-side">{nbAttente}</span>}
            </NavLink>

            <NavLink
              to="/journalisation"
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              <ScrollText className="icon" size={20} color="#171B60" />
              <span>{t('journalisation')}</span>
            </NavLink>
          </>
        )}

        <button className="sidebar-link sidebar-install-btn" onClick={handleInstall}>
          <Smartphone className="icon" size={20} color="#8E5BA6" />
          <span>{t('installer')}</span>
        </button>

        <NavLink
          to={`/profil/${user.id}`}
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          <UserIcon className="icon" size={20} color="#CCB3D7" />
          <span>{t('profil')}</span>
        </NavLink>

        <NavLink
          to="/parametres"
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          <Settings className="icon" size={20} color="#3D5567" />
          <span>{t('parametres')}</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <button className="btn-deconnexion-side" onClick={handleDeconnexion}>
          <LogOut size={18} style={{ marginRight: '10px' }} />
          {t('deconnexion')}
        </button>
      </div>
    </aside>
  );
}
