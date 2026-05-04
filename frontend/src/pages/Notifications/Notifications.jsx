import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, Info, Ticket, FileText, AlertTriangle, Inbox, Check, X } from 'lucide-react';
import './Notifications.css';

export default function Notifications() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Fausse liste étendue pour la page
  const [notifications, setNotifications] = useState([
    { id: 1, texte: "Bienvenue sur le nouveau portail Ooredoo !", date: "2026-04-29T10:00:00Z", lue: false, type: 'info' },
    { id: 2, texte: "Un nouveau ticket a été créé pour la zone Tunis.", date: "2026-04-29T09:30:00Z", lue: false, type: 'ticket' },
    { id: 3, texte: "Le rapport quotidien des accès est prêt.", date: "2026-04-28T20:05:00Z", lue: true, type: 'rapport' },
    { id: 4, texte: "Alerte : Un ticket en zone Sfax dépasse le délai SLA de 72H.", date: "2026-04-28T15:20:00Z", lue: true, type: 'alerte' },
    { id: 5, texte: "Votre profil a été mis à jour avec succès.", date: "2026-04-27T11:00:00Z", lue: true, type: 'info' },
    { id: 6, texte: "Nouvelle directive technique pour les activations Fix Jdid.", date: "2026-04-26T14:00:00Z", lue: true, type: 'info' },
  ]);

  const toggleLue = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, lue: !n.lue } : n
    ));
  };

  const marquerToutesLues = () => {
    setNotifications(notifications.map(n => ({ ...n, lue: true })));
    localStorage.setItem(`notifs_read_${user?.id}`, 'true');
  };

  const supprimerNotif = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifs = unreadOnly ? notifications.filter(n => !n.lue) : notifications;

  return (
    <div className="notifications-page animated fadeIn">
      <div className="notifs-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell size={28} color="var(--rouge)" />
          <h2>{t('notifications')}</h2>
        </div>
        <div className="notifs-actions">
          <button className="btn-secondary" onClick={() => setUnreadOnly(!unreadOnly)}>
            {unreadOnly ? "Voir tout" : "Voir non lues"}
          </button>
          <button className="btn-rouge" onClick={marquerToutesLues}>
            {t('marquer_lues')}
          </button>
        </div>
      </div>

      <div className="card notifs-container">
        {filteredNotifs.length > 0 ? (
          <div className="notifs-list">
            {filteredNotifs.map(n => (
              <div key={n.id} className={`notif-item ${n.lue ? 'lue' : 'non-lue'} ${n.type}`}>
                <div className="notif-icon">
                  {n.type === 'ticket' ? <Ticket size={20} color="#FEBD3B" /> : 
                   n.type === 'alerte' ? <AlertTriangle size={20} color="#F26A36" /> : 
                   n.type === 'rapport' ? <FileText size={20} color="#62BB46" /> : 
                   <Info size={20} color="#00BDF2" />}
                </div>
                <div className="notif-content">
                  <p className="notif-text">{n.texte}</p>
                  <span className="notif-date">
                    {new Date(n.date).toLocaleString(lang === 'ar' ? 'ar-TN' : 'fr-FR', {
                      day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="notif-item-actions">
                  {!n.lue && (
                    <button className="btn-circle check" title="Marquer comme lue" onClick={() => toggleLue(n.id)}>
                      <Check size={16} />
                    </button>
                  )}
                  <button className="btn-circle delete" title="Supprimer" onClick={() => supprimerNotif(n.id)}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="notifs-empty">
            <div className="empty-icon">
              <Inbox size={60} strokeWidth={1} />
            </div>
            <p>Aucune notification à afficher.</p>
          </div>
        )}
      </div>
    </div>
  );
}
