// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Bell, LayoutDashboard, BarChart2, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import dashboardService from '../../services/dashboardService';
import './Dashboard.css';

// Couleurs graphiques
const COULEURS = { activation: '#E30613', plainte: '#F97316', resiliation: '#2563EB' };
const COULEURS_PRODUIT = { outdoor: '#E30613', indoor: '#2563EB', pro: '#1A8A4E' };
const PIE_COLORS = ['#E30613', '#F97316', '#2563EB', '#1A8A4E', '#9333EA'];

function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [vue, setVue] = useState('synthese'); // 'synthese' ou 'powerbi'
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [filtreType, setFiltreType] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtreProduit, setFiltreProduit] = useState('');
  const tableRef = useRef(null);

  const handleKpiClick = (type, statut) => {
    setFiltreType(type);
    setFiltreStatut(statut);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const chargerStats = useCallback(async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
      setErreur(e.response?.data?.message || e.message || 'Erreur inconnue');
    }
    setChargement(false);
  }, []);

  const chargerTickets = useCallback(async () => {
    try {
      const params = {};
      if (filtreType) params.type = filtreType;
      if (filtreStatut) params.statut = filtreStatut;
      if (filtreProduit) params.produit = filtreProduit;
      const data = await dashboardService.getTickets(params);
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) { }
  }, [filtreType, filtreStatut, filtreProduit]);

  // Transformations de données mémorisées
  const dataEvolution = React.useMemo(() => {
    if (!stats?.evolution || !Array.isArray(stats.evolution)) return [];
    try {
      const evolution = stats.evolution;
      const moisUniques = [...new Set(evolution.map(e => e.mois))].sort();
      return moisUniques.map(mois => {
        const obj = { mois: mois.toString().slice(5) };
        ['activation', 'plainte', 'resiliation'].forEach(type => {
          const found = evolution.find(e => e.mois === mois && e.type_ticket === type);
          obj[type] = found?.total || 0;
        });
        return obj;
      });
    } catch (err) { return []; }
  }, [stats?.evolution]);

  const dataSLA = React.useMemo(() => {
    if (!stats?.sla || !Array.isArray(stats.sla)) return [];
    try {
      return stats.sla.map(s => ({
        name: s.type_ticket || 'Inconnu',
        'Dans SLA': s.total > 0 ? Math.round((s.dans_sla / s.total) * 100) : 0,
        'Hors SLA': s.total > 0 ? Math.round(((s.total - s.dans_sla) / s.total) * 100) : 0,
        moy_reel: s.moy_resolution || 0,
        moy_cible: s.moy_cible || 0
      }));
    } catch (err) { return []; }
  }, [stats?.sla]);

  const dataPie = React.useMemo(() => {
    if (!stats?.parProduit || !Array.isArray(stats.parProduit)) return [];
    return stats.parProduit.map(p => ({ name: p.produit, value: p.total || 0 }));
  }, [stats?.parProduit]);


  useEffect(() => {
    chargerStats();
    chargerTickets();
  }, [chargerStats, chargerTickets]);

  if (chargement) return <div className="chargement"><div className="spinner"></div><p>Chargement...</p></div>;
  if (erreur) return <div className="erreur-msg" style={{ color: 'red', textAlign: 'center', padding: '50px' }}>{erreur}</div>;
  if (!stats) return <div className="erreur-msg">Données introuvables</div>;

  let kpis, parZone;
  try {
    kpis = stats.kpis || { total: 0, activations: 0, plaintes: 0, resiliations: 0, resolus: 0, en_cours: 0 };
    parZone = Array.isArray(stats.parZone) ? stats.parZone : [];
  } catch (e) {
    return <div className="erreur-msg">Erreur de structure des données</div>;
  }

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1>{t('dashboard')} SLA</h1>
          <p>Fix Jdid Ooredoo — {t('bienvenue')}
            {user?.zone && ` | Zone : ${user?.zone}`}
          </p>
        </div>
      </div>

      {user?.role === 'admin' && stats?.kpis?.utilisateurs_en_attente > 0 && (
        <div className="alert-box animated pulse" onClick={() => navigate('/utilisateurs')}>
          <Bell className="icon" size={24} color="#F26A36" />
          <p>Vous avez <strong>{stats.kpis.utilisateurs_en_attente}</strong> demandes de création de compte en attente d'approbation.</p>
          <button className="btn-small">{t('voir')}</button>
        </div>
      )}

      <div className="dash-tabs">
        <button className={`tab-btn ${vue === 'synthese' ? 'active' : ''}`} onClick={() => setVue('synthese')}>
          <LayoutDashboard size={18} color={vue === 'synthese' ? 'white' : '#00BDF2'} style={{ marginRight: '8px' }} />
          {t('synthese_native')}
        </button>
        <button className={`tab-btn ${vue === 'powerbi' ? 'active' : ''}`} onClick={() => setVue('powerbi')}>
          <BarChart2 size={18} color={vue === 'powerbi' ? 'white' : '#62BB46'} style={{ marginRight: '8px' }} />
          {t('analytique_pbi')}
        </button>
      </div>

      {vue === 'powerbi' ? (
        <div className="powerbi-wrapper animated fadeIn">
          <div className="powerbi-actions" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
            <button 
              className="btn-pbi-full"
              onClick={() => window.open("https://app.powerbi.com/reportEmbed?reportId=92ab7e74-2874-45d4-899a-dea7031bccfd&autoAuth=true&ctid=dbd6664d-4eb9-46eb-99d8-5c43ba153c61&actionBarEnabled=true&reportCopilotInEmbed=true", "_blank")}
              style={{
                backgroundColor: '#E30613',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <BarChart2 size={18} /> Ouvrir le Dashboard Interactif (Plein Écran)
            </button>
          </div>
          <div className="iframe-container card">
            <iframe
              title="Dashbord_Fixe_Jdid"
              width="100%" height="100%"
              src="https://app.powerbi.com/reportEmbed?reportId=92ab7e74-2874-45d4-899a-dea7031bccfd&autoAuth=true&ctid=dbd6664d-4eb9-46eb-99d8-5c43ba153c61&actionBarEnabled=true&reportCopilotInEmbed=true"
              frameBorder="0" allowFullScreen={true}
            ></iframe>
          </div>
        </div>
      ) : (
        <>
          <div className="kpi-grille">
            <div className="kpi-card total" onClick={() => handleKpiClick('', '')}>
              <div className="kpi-valeur">{kpis.total}</div>
              <div className="kpi-label">{t('total_tickets')}</div>
            </div>
            <div className="kpi-card activations" onClick={() => handleKpiClick('activation', '')}>
              <div className="kpi-valeur">{kpis.activations}</div>
              <div className="kpi-label">{t('activations')}</div>
            </div>
            <div className="kpi-card plaintes" onClick={() => handleKpiClick('plainte', '')}>
              <div className="kpi-valeur">{kpis.plaintes}</div>
              <div className="kpi-label">{t('plaintes')}</div>
            </div>
            <div className="kpi-card resiliations" onClick={() => handleKpiClick('resiliation', '')}>
              <div className="kpi-valeur">{kpis.resiliations}</div>
              <div className="kpi-label">{t('resiliations')}</div>
            </div>
            <div className="kpi-card resolus" onClick={() => handleKpiClick('', 'resolu')}>
              <div className="kpi-valeur">{kpis.resolus}</div>
              <div className="kpi-label">{t('resolus')}</div>
            </div>
            <div className="kpi-card en-cours" onClick={() => handleKpiClick('', 'en_cours')}>
              <div className="kpi-valeur">{kpis.en_cours}</div>
              <div className="kpi-label">{t('en_cours')}</div>
            </div>
          </div>

          <div className="graphiques-grille">
            <div className="card graphique-card">
              <h3>{t('taux_sla')} (%)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dataSLA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Dans SLA" name={t('dans_sla')} fill="#1A8A4E" />
                  <Bar dataKey="Hors SLA" name={t('hors_sla')} fill="#E30613" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card graphique-card">
              <h3>{t('evolution')}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dataEvolution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="activation" stroke={COULEURS.activation} dot={false} />
                  <Line type="monotone" dataKey="plainte" stroke={COULEURS.plainte} dot={false} />
                  <Line type="monotone" dataKey="resiliation" stroke={COULEURS.resiliation} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card graphique-card">
              <h3>{t('repartition_produit') || 'Répartition par Produit'}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={dataPie}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ marginTop: 24 }} ref={tableRef}>
            <div className="tableau-header">
              <h3>{t('liste_tickets')}</h3>
            </div>
            <div className="tableau-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('col_id')}</th>
                    <th>{t('col_type')}</th>
                    <th>{t('col_client')}</th>
                    <th>{t('col_zone')}</th>
                    <th>{t('col_statut')}</th>
                    <th>{t('col_date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(tickets) && tickets.map(ticket => (
                      <tr key={ticket.id}>
                        <td>#{ticket.id}</td>
                        <td>{ticket.type_ticket}</td>
                        <td>{ticket.client_nom}</td>
                        <td>{ticket.zone}</td>
                        <td>{ticket.statut}</td>
                        <td>{new Date(ticket.date_creation).toLocaleDateString()}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
              {(!tickets || tickets.length === 0) && <p style={{ textAlign: 'center', padding: '20px' }}>{t('aucun_ticket')}</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(Dashboard);
