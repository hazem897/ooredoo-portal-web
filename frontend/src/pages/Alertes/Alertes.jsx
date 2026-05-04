// frontend/src/pages/Alertes/Alertes.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import alertesService from '../../services/alertesService';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  AlertCircle, Rocket, Ban, MessageSquare, Calendar, Snowflake, 
  Send, RefreshCw, ChevronDown, CheckCircle2, XCircle, Mail, 
  Search, FileSpreadsheet, FileDown, PlusCircle
} from 'lucide-react';
import './Alertes.css';

// ─── Helpers ──────────────────────────────────────────────────
function formatHeures(h) {
  if (h >= 24) return `${Math.floor(h / 24)}j ${h % 24}h`;
  return `${h}h`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function BadgeType({ type }) {
  const labels = { activation: 'Activation', plainte: 'Plainte', resiliation: 'Résiliation' };
  return (
    <span className={`badge-type ${type}`}>{labels[type] || type}</span>
  );
}

function BadgeStatut({ statut }) {
  return <span className={`badge-statut ${statut}`}>{statut?.replace('_', ' ')}</span>;
}

function BadgeUrgence({ heures }) {
  if (heures >= 120) return <span className="badge-urgence critique"><AlertCircle size={12} style={{ marginRight: 4 }} /> {formatHeures(heures)}</span>;
  if (heures >= 72)  return <span className="badge-urgence alerte"><AlertCircle size={12} style={{ marginRight: 4 }} /> {formatHeures(heures)}</span>;
  return                     <span className="badge-urgence normal"><AlertCircle size={12} style={{ marginRight: 4 }} /> {formatHeures(heures)}</span>;
}

// ─── Sous-composant : Panneau d'alerte ────────────────────────
function AlertePanel({ id, title, subtitle, icon, typeAlerte, btnClass, btnLabel, tickets = [], onRelanceIndividuelle, onRelanceGroupe }) {
  const [ouvert, setOuvert] = useState(false);
  const [selectionnes, setSelectionnes] = useState([]);
  const [messagePerso, setMessagePerso] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [envoi, setEnvoi] = useState(false); // état chargement

  const panelClass = id; // 'panel-rdv' | 'panel-encours' | 'panel-gele'
  const zero = tickets.length === 0;

  const toggleSelectAll = () => {
    if (selectionnes.length === tickets.length) {
      setSelectionnes([]);
    } else {
      setSelectionnes(tickets.map(t => t.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectionnes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRelanceGroupe = async () => {
    if (selectionnes.length === 0) return;
    setEnvoi(true);
    try {
      await onRelanceGroupe(selectionnes, typeAlerte, messagePerso);
      setSelectionnes([]);
      setMessagePerso('');
      setShowMessage(false);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className={`alerte-panel ${panelClass}`}>
      {/* En-tête cliquable */}
      <div className="panel-header" onClick={() => setOuvert(o => !o)}>
        <div className="panel-header-left">
          <div className="panel-icon">{icon}</div>
          <div>
            <p className="panel-title">{title}</p>
            <p className="panel-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="panel-header-right">
          <span className={`panel-badge ${zero ? 'zero' : ''}`}>
            {zero ? <CheckCircle2 size={14} style={{ marginRight: 6 }} /> : null}
            {zero ? 'Aucune alerte' : `${tickets.length} ticket${tickets.length > 1 ? 's' : ''}`}
          </span>
          <ChevronDown className={`chevron ${ouvert ? 'open' : ''}`} size={18} />
        </div>
      </div>

      {/* Corps */}
      {ouvert && (
        <div className="panel-body">
          {/* Barre d'outils */}
          <div className="panel-toolbar">
            <div className="toolbar-left">
              <button className="btn-select-all" onClick={toggleSelectAll} disabled={zero}>
                {selectionnes.length === tickets.length && tickets.length > 0 ? '☐ Désélectionner' : '☑ Sélectionner tout'}
              </button>
              {selectionnes.length > 0 && (
                <span className="selected-count">{selectionnes.length} sélectionné(s)</span>
              )}
            </div>
            <div className="toolbar-right">
              {tickets.length > 0 && (
                <button
                  className="btn-select-all"
                  onClick={() => setShowMessage(m => !m)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageSquare size={14} /> {showMessage ? 'Masquer message' : 'Ajouter un message'}
                </button>
              )}
              <button
                className={`btn-relance ${btnClass}`}
                onClick={handleRelanceGroupe}
                disabled={selectionnes.length === 0 || envoi}
                title={selectionnes.length === 0 ? 'Sélectionnez des tickets' : `Envoyer relance groupée aux Zone Managers`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {envoi ? <span className="spinner-sm" /> : <Send size={18} />}
                {btnLabel} {selectionnes.length > 0 && `(${selectionnes.length})`}
              </button>
            </div>
          </div>

          {/* Zone de message personnalisé */}
          {showMessage && (
            <div className="message-perso-area">
              <label>💬 Message personnalisé à joindre à l'email :</label>
              <textarea
                value={messagePerso}
                onChange={e => setMessagePerso(e.target.value)}
                placeholder="Exemple : Veuillez traiter ce dossier en priorité avant vendredi. Merci."
                rows={3}
              />
            </div>
          )}

          {/* Tableau */}
          {zero ? (
            <div className="empty-state">
              <div className="empty-state-icon"><CheckCircle2 size={48} color="#62BB46" /></div>
              <p>Aucun ticket en alerte dans cette catégorie</p>
            </div>
          ) : (
            <div className="panel-table-wrapper">
              <table className="alerte-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th>N° Ticket</th>
                    <th>Type</th>
                    <th>Client</th>
                    <th>Zone</th>
                    <th>Produit</th>
                    <th>Statut</th>
                    <th>Délai écoulé</th>
                    <th>RDV / CRM</th>
                    <th>Relances</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <TicketRow
                      key={t.id}
                      ticket={t}
                      selected={selectionnes.includes(t.id)}
                      onSelect={() => toggleSelect(t.id)}
                      typeAlerte={typeAlerte}
                      btnClass={btnClass}
                      messagePerso={messagePerso}
                      onRelance={onRelanceIndividuelle}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Ligne de ticket ─────────────────────────────────────────
function TicketRow({ ticket: t, selected, onSelect, typeAlerte, btnClass, messagePerso, onRelance }) {
  const [loading, setLoading] = useState(false);

  const handleRelance = async () => {
    setLoading(true);
    try {
      await onRelance(t.id, typeAlerte, messagePerso);
    } finally {
      setLoading(false);
    }
  };

  const rdvInfo = t.date_prise_rdv
    ? <span style={{ color: '#62BB46', fontSize: 12, display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {formatDate(t.date_prise_rdv)}</span>
    : <span className="badge-rdv-missing" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Non renseigné</span>;

  const crmInfo = t.crm_case
    ? <span style={{ fontWeight: 600, color: '#171B60', fontSize: 12, display: 'flex', alignItems: 'center', gap: '4px' }}><Search size={12} /> {t.crm_case}</span>
    : <span className="badge-rdv-missing" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Non renseigné</span>;

  const btnVariant = typeAlerte === 'rdv_non_pris' ? 'rdv'
                   : typeAlerte === 'en_cours_72h' ? 'encours'
                   : 'gele';

  return (
    <tr className={selected ? 'selected' : ''}>
      <td>
        <input type="checkbox" checked={selected} onChange={onSelect} />
      </td>
      <td>
        <span className="badge-ticket-id" style={{ color: '#6366f1' }}>#{t.id}</span>
      </td>
      <td><BadgeType type={t.type_ticket} /></td>
      <td>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.client_nom || '—'}</div>
        <div style={{ fontSize: 11, color: '#888' }}>{t.client_tel || ''}</div>
      </td>
      <td style={{ fontWeight: 600 }}>{t.zone || '—'}</td>
      <td>
        <div style={{ fontWeight: 600 }}>{t.produit}</div>
        <div style={{ fontSize: 11, color: '#888' }}>{t.debit || ''}</div>
      </td>
      <td><BadgeStatut statut={t.statut} /></td>
      <td><BadgeUrgence heures={t.heures_ecoulees || 0} /></td>
      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rdvInfo}
          {crmInfo}
          {t.statut_gel === 'oui' && (
            <span className="badge-gel" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Snowflake size={12} /> Gelé</span>
          )}
        </div>
      </td>
      <td>
        {t.nb_relances > 0 ? (
          <div>
            <span style={{ fontWeight: 700, color: '#6366f1' }}>{t.nb_relances}</span>
            <div style={{ fontSize: 11, color: '#888' }}>
              {t.derniere_relance ? formatDate(t.derniere_relance) : ''}
            </div>
          </div>
        ) : (
          <span style={{ color: '#ccc', fontSize: 12 }}>Aucune</span>
        )}
      </td>
      <td>
        <button
          className={`btn-relance-ind ${btnVariant}`}
          onClick={handleRelance}
          disabled={loading}
          title={`Envoyer une relance aux Zone Managers pour ce ticket`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {loading ? <span className="spinner-sm" style={{ width: 12, height: 12 }} /> : <Mail size={14} />}
          Relancer
        </button>
      </td>
    </tr>
  );
}

// ─── Toast ────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const iconSet = { 
    success: <CheckCircle2 size={18} color="#62BB46" />, 
    error: <XCircle size={18} color="#F26A36" />, 
    info: <AlertCircle size={18} color="#00BDF2" /> 
  };
  return (
    <div className={`alertes-toast ${type}`}>
      <span>{iconSet[type]}</span>
      <span>{message}</span>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────
export default function Alertes() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [erreur, setErreur]     = useState(null);
  const [toast, setToast]       = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [importStatus, setImportStatus] = useState({ type: '', loading: false });

  const { user } = useAuth();
  const { t } = useLanguage();

  const fileRefs = {
    activation: useRef(null),
    resiliation: useRef(null),
    plainte: useRef(null)
  };

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const charger = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErreur(null);
    try {
      const result = await alertesService.getAlertes();
      setData(result);
    } catch (e) {
      setErreur(e.response?.data?.message || e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleImport = async (type, file) => {
    if (!file) return;
    setImportStatus({ type, loading: true });
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/tickets/import/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(res.data.message, 'success');
      charger(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de l\'importation', 'error');
    } finally {
      setImportStatus({ type: '', loading: false });
      if (fileRefs[type].current) fileRefs[type].current.value = '';
    }
  };

  useEffect(() => { charger(); }, [charger]);

  const handleRelanceIndividuelle = useCallback(async (ticketId, typeAlerte, messagePerso) => {
    try {
      const res = await alertesService.envoyerRelance(ticketId, typeAlerte, messagePerso);
      showToast(`✅ ${res.message}`, 'success');
      charger(true);
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur lors de l\'envoi', 'error');
    }
  }, [showToast, charger]);

  const handleRelanceGroupe = useCallback(async (ticketIds, typeAlerte, messagePerso) => {
    try {
      const res = await alertesService.envoyerRelanceGroupe(ticketIds, typeAlerte, messagePerso);
      showToast(`✅ ${res.message}`, 'success');
      charger(true);
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur lors de l\'envoi groupé', 'error');
    }
  }, [showToast, charger]);

  if (loading) return (
    <div className="alertes-loading">
      <div className="alertes-spinner" />
      <p>Chargement des alertes...</p>
    </div>
  );

  if (erreur) return (
    <div className="alertes-page">
      <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: 24, color: '#b91c1c', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
        <p style={{ margin: 0, fontWeight: 600 }}>{erreur}</p>
        <button onClick={() => charger()} style={{ marginTop: 12, padding: '8px 20px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          Réessayer
        </button>
      </div>
    </div>
  );

  const stats = data?.stats || {};

  return (
    <div className="alertes-page">

      {/* Header */}
      <div className="alertes-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={32} color="#F26A36" /> Centre d'Alertes &amp; Relances
          </h1>
          <p>
            Suivez les tickets en anomalie et envoyez des relances aux Zone Managers par email.
            Les réponses vous parviennent directement.
          </p>
        </div>
        <button
          className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
          onClick={() => charger(true)}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* IMPORT SECTION */}
      {user?.role === 'admin' && (
        <div className="import-grid animated fadeIn">
          {['activation', 'resiliation', 'plainte'].map(type => (
            <div 
              key={type} 
              className={`import-card ${importStatus.type === type ? 'loading' : ''}`}
              onClick={() => fileRefs[type].current.click()}
            >
              <span className="import-icon">
                {type === 'activation' ? <Rocket size={32} color="#00BDF2" /> : 
                 type === 'resiliation' ? <Ban size={32} color="#F26A36" /> : 
                 <MessageSquare size={32} color="#FEBD3B" />}
              </span>
              <h4>{t(type)}</h4>
              <p>Importer fichier Excel/CSV</p>
              <input 
                type="file" 
                ref={fileRefs[type]}
                onChange={(e) => handleImport(type, e.target.files[0])}
                style={{ display: 'none' }}
                accept=".xlsx, .xls, .csv"
              />
              <button className="btn-import-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <PlusCircle size={16} />
                {importStatus.type === type ? 'Importation...' : 'Choisir un fichier'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* KPI Summary */}
      <div className="alertes-kpis">
        <div className="alerte-kpi total">
          <div className="kpi-number">{stats.total || 0}</div>
          <div className="kpi-label">Total alertes</div>
          <AlertCircle className="kpi-icon" size={24} color="#F26A36" />
        </div>
        <div className="alerte-kpi rdv">
          <div className="kpi-number">{stats.activations || 0}</div>
          <div className="kpi-label">Activations</div>
          <Rocket className="kpi-icon" size={24} color="#00BDF2" />
        </div>
        <div className="alerte-kpi resiliation">
          <div className="kpi-number">{stats.resiliations || 0}</div>
          <div className="kpi-label">Résiliations</div>
          <Ban className="kpi-icon" size={24} color="#F26A36" />
        </div>
        <div className="alerte-kpi plainte">
          <div className="kpi-number">{stats.plaintes || 0}</div>
          <div className="kpi-label">Plaintes</div>
          <MessageSquare className="kpi-icon" size={24} color="#FEBD3B" />
        </div>
      </div>

      {/* Panneaux d'alertes */}
      <div className="alertes-panels">

        {/* TABLEAU 1 : ACTIVATIONS */}
        <AlertePanel
          id="panel-rdv"
          title="Alertes Activations"
          subtitle="Tickets d'activation avec anomalies (RDV non pris, délai dépassé ou gelé)"
          icon={<Rocket size={28} color="#00BDF2" />}
          typeAlerte="activation"
          btnClass="btn-relance-rdv"
          btnLabel="Relancer Activation"
          tickets={data?.activations || []}
          onRelanceIndividuelle={handleRelanceIndividuelle}
          onRelanceGroupe={handleRelanceGroupe}
        />

        {/* TABLEAU 2 : RÉSILIATIONS */}
        <AlertePanel
          id="panel-gele"
          title="Alertes Résiliations"
          subtitle="Tickets de résiliation en cours depuis plus de 48H"
          icon={<Ban size={28} color="#F26A36" />}
          typeAlerte="resiliation"
          btnClass="btn-relance-gele"
          btnLabel="Relancer Résiliation"
          tickets={data?.resiliations || []}
          onRelanceIndividuelle={handleRelanceIndividuelle}
          onRelanceGroupe={handleRelanceGroupe}
        />

        {/* TABLEAU 3 : PLAINTES */}
        <AlertePanel
          id="panel-encours"
          title="Alertes Plaintes"
          subtitle="Plaintes non résolues depuis plus de 48H"
          icon={<MessageSquare size={28} color="#FEBD3B" />}
          typeAlerte="plainte"
          btnClass="btn-relance-encours"
          btnLabel="Relancer Plainte"
          tickets={data?.plaintes || []}
          onRelanceIndividuelle={handleRelanceIndividuelle}
          onRelanceGroupe={handleRelanceGroupe}
        />
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
