// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart,
  AreaChart, Area
} from 'recharts';
import { Bell, LayoutDashboard, BarChart2, MapPin, CheckCircle, AlertCircle, XCircle, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import dashboardService from '../../services/dashboardService';
import './Dashboard.css';

// Couleurs graphiques officielles Ooredoo
const COULEURS = { 
  activation: '#00BDF2', 
  plainte: '#FEBD3B', 
  resiliation: '#F26A36',
  resolu: '#62BB46',
  total: '#E30613'
};
const PIE_COLORS = ['#E30613', '#00BDF2', '#FEBD3B', '#62BB46', '#F26A36', '#171B60'];

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

  if (chargement) return <div className="chargement"><div className="logo-loading"></div><p>Chargement...</p></div>;
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
        <div className="dash-header-actions">
          <button 
            className="btn-site-public" 
            onClick={() => navigate('/')}
            title="Aller sur la page d'accueil publique"
          >
            <Home size={18} />
            <span>Page d'accueil</span>
          </button>
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
              onClick={() => window.open("https://app.powerbi.com/reportEmbed?reportId=92ab7e74-2874-45d4-899a-dea7031bccfd&autoAuth=true&ctid=dbd6664d-4eb9-46eb-99d8-5c43ba153c61", "_blank")}
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
              src="https://app.powerbi.com/reportEmbed?reportId=92ab7e74-2874-45d4-899a-dea7031bccfd&autoAuth=true&ctid=dbd6664d-4eb9-46eb-99d8-5c43ba153c61"
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
            {/* Graphique 1 : Performance SLA (Barres avec Gradients) */}
            <div className="card graphique-card premium-chart">
              <div className="chart-header">
                <h3>{t('taux_sla')} (%)</h3>
                <span className="chart-badge success">Live</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dataSLA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSla" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A8A4E" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1A8A4E" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorHorsSla" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E30613" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#E30613" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: '#f8f9fa' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="Dans SLA" name={t('dans_sla')} fill="url(#colorSla)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Hors SLA" name={t('hors_sla')} fill="url(#colorHorsSla)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique 2 : Évolution (AreaChart avec Gradient) */}
            <div className="card graphique-card premium-chart">
              <div className="chart-header">
                <h3>{t('evolution')}</h3>
                <div className="chart-legend-dots">
                  <span className="dot activation"></span>
                  <span className="dot plainte"></span>
                  <span className="dot resiliation"></span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dataEvolution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="activation" stroke={COULEURS.activation} strokeWidth={3} dot={{ r: 4, fill: COULEURS.activation }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="plainte" stroke={COULEURS.plainte} strokeWidth={3} dot={{ r: 4, fill: COULEURS.plainte }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="resiliation" stroke={COULEURS.resiliation} strokeWidth={3} dot={{ r: 4, fill: COULEURS.resiliation }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique 3 : Répartition par Produit */}
            <div className="card graphique-card premium-chart">
              <div className="chart-header">
                <h3>Répartition par Categorie</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={dataPie}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {dataPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="graphiques-grille" style={{ marginTop: '24px' }}>
            {/* Graphique 4 : Radar Performance */}
            <div className="card graphique-card premium-chart">
              <div className="chart-header">
                <h3>Analyse Multidimensionnelle</h3>
                <span className="chart-badge success">Global</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart outerRadius={90} data={[
                  { subject: 'Vitesse', A: 120, fullMark: 150 },
                  { subject: 'Qualité', A: 98, fullMark: 150 },
                  { subject: 'SLA', A: 86, fullMark: 150 },
                  { subject: 'Volume', A: 99, fullMark: 150 },
                  { subject: 'Satisfaction', A: 85, fullMark: 150 },
                ]}>
                  <PolarGrid stroke="#eee" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} />
                  <Radar name="Performance" dataKey="A" stroke={COULEURS.total} fill={COULEURS.total} fillOpacity={0.4} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique 5 : Volume vs Résolution */}
            <div className="card graphique-card premium-chart">
              <div className="chart-header">
                <h3>Volume vs Taux Résolution</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={dataEvolution}>
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <CartesianGrid stroke="#f5f5f5" vertical={false} />
                  <Bar dataKey="activation" name="Volume" barSize={20} fill={COULEURS.activation} radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="plainte" name="Taux %" stroke={COULEURS.total} strokeWidth={3} dot={{ r: 5, fill: COULEURS.total }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique 6 : Répartition Statut */}
            <div className="card graphique-card premium-chart">
              <div className="chart-header">
                <h3>Répartition par Statut</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[
                  { name: 'Activ.', resolu: 400, en_cours: 240 },
                  { name: 'Plaintes', resolu: 300, en_cours: 139 },
                  { name: 'Resil.', resolu: 200, en_cours: 980 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend />
                  <Bar dataKey="resolu" name="Résolu" stackId="a" fill={COULEURS.resolu} />
                  <Bar dataKey="en_cours" name="En cours" stackId="a" fill={COULEURS.plainte} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="graphiques-grille" style={{ marginTop: '24px' }}>
            {/* Graphique 7 : AreaChart Empilé */}
            <div className="card graphique-card premium-chart">
              <div className="chart-header">
                <h3>Évolution Cumulative</h3>
                <span className="chart-badge success">Trends</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dataEvolution}>
                  <defs>
                    <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E30613" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E30613" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="activation" stackId="1" stroke="#E30613" fill="url(#colorAct)" />
                  <Area type="monotone" dataKey="plainte" stackId="1" stroke="#FEBD3B" fill="#FEBD3B" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique 8 : BarChart Horizontal (Top Zones) */}
            <div className="card graphique-card premium-chart">
              <div className="chart-header">
                <h3>Top 5 Zones Actives</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart layout="vertical" data={[
                  { name: 'Tunis', val: 400 },
                  { name: 'Sfax', val: 300 },
                  { name: 'Sousse', val: 250 },
                  { name: 'Ariana', val: 200 },
                  { name: 'Bizerte', val: 150 },
                ]} margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="val" name="Tickets" fill="#171B60" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique 9 : Répartition Client (Donut 2) */}
            <div className="card graphique-card premium-chart">
              <div className="chart-header">
                <h3>Segment Clientèle</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'B2B (Entreprises)', value: 45 },
                      { name: 'B2C (Particuliers)', value: 55 },
                    ]}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    <Cell fill="#E30613" />
                    <Cell fill="#171B60" />
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card dashboard-table-card" style={{ marginTop: 24 }} ref={tableRef}>
            <div className="tableau-header">
              <h3>{t('liste_tickets')}</h3>
              <div className="table-actions">
                <div className="filtres">
                  <select onChange={(e) => {/* Logique de filtre */}}>
                    <option value="">Tous les types</option>
                    <option value="activation">Activations</option>
                    <option value="plainte">Plaintes</option>
                    <option value="resiliation">Résiliations</option>
                  </select>
                  <select onChange={(e) => {/* Logique de filtre */}}>
                    <option value="">Tous les statuts</option>
                    <option value="ouvert">Ouvert</option>
                    <option value="en_cours">En cours</option>
                    <option value="resolu">Résolu</option>
                  </select>
                </div>
                <span className="badge-count">{tickets.length} tickets</span>
              </div>
            </div>
            <div className="tableau-container">
              <table className="modern-table">
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
                      <tr key={ticket.id} className="table-row-hover">
                        <td className="col-id">#{ticket.id}</td>
                        <td className="col-type">
                          <div className="type-badge-container">
                            {ticket.type_ticket === 'activation' ? <CheckCircle size={14} color="#00BDF2" /> : 
                             ticket.type_ticket === 'plainte' ? <AlertCircle size={14} color="#FEBD3B" /> : 
                             <XCircle size={14} color="#F26A36" />}
                            <span className={`type-text ${ticket.type_ticket}`}>{t(ticket.type_ticket)}</span>
                          </div>
                        </td>
                        <td className="col-client">{ticket.client_nom}</td>
                        <td className="col-zone">
                          <span className="zone-tag">{ticket.zone}</span>
                        </td>
                        <td className="col-statut">
                          <span className={`status-badge ${ticket.statut === 'ouvert' ? 'open' : ticket.statut === 'en_cours' ? 'pending' : 'resolved'}`}>
                            {t(ticket.statut)}
                          </span>
                        </td>
                        <td className="col-date">{new Date(ticket.date_creation).toLocaleDateString()}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
              {(!tickets || tickets.length === 0) && <div className="empty-state">
                <Bell size={40} color="#ccc" />
                <p>{t('aucun_ticket')}</p>
              </div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(Dashboard);
