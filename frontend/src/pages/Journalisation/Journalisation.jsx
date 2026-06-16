import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useLanguage } from '../../context/LanguageContext';
import { ScrollText, FileSpreadsheet, FileText, FileDown, Search } from 'lucide-react';
import api from '../../utils/api';
import './Journalisation.css';

export default function Journalisation() {
  const { t, lang } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: '',
    utilisateur: '',
    role: '',
    action: ''
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/logs');
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[JOURNALISATION] Erreur recup logs:', err.response?.data?.message || err.message);
      setLogs([]);
    }
  };

  const safeText = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    return String(value);
  };

  const getUserName = (log) => {
    const fullName = `${safeText(log.prenom)} ${safeText(log.nom)}`.trim();
    return fullName || '-';
  };

  const getRoleLabel = (role) => {
    const value = safeText(role, '-');
    return value === '-' ? value : value.replace(/_/g, ' ');
  };

  const getBadgeRoleClass = (role) => safeText(role).replace(/\s+/g, '_');

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString(lang === 'ar' ? 'ar-TN' : 'fr-FR');
  };

  const formatAction = (action) => {
    if (!action) return '-';

    const rawAction = safeText(action);
    const lowerAction = rawAction.toLowerCase();

    if (lowerAction === 'login') return t('connexion');
    if (lowerAction === 'logout') return t('deconnexion');
    if (lowerAction === 'timeout') return t('action_timeout');
    if (lowerAction.includes('post sur /api/users')) return t('action_create_user');
    if (lowerAction.includes('delete sur /api/users')) return t('action_delete_user');
    if (lowerAction.includes("mise a jour d'un utilisateur") || lowerAction.includes("mise à jour d'un utilisateur")) {
      return t('action_approve_refuse');
    }
    if (lowerAction.includes('reset-password')) return t('action_reset_password');
    if (lowerAction.includes('approuver')) return t('action_change_status');
    if (lowerAction.includes('import')) return t('action_import');

    return rawAction;
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredLogs = logs.filter(log => {
    if (filters.dateDebut && new Date(log.cree_le) < new Date(filters.dateDebut)) return false;
    if (filters.dateFin && new Date(log.cree_le) > new Date(filters.dateFin)) return false;

    if (filters.utilisateur) {
      const searchStr = filters.utilisateur.toLowerCase();
      const userName = getUserName(log).toLowerCase();
      const email = safeText(log.email).toLowerCase();
      if (!userName.includes(searchStr) && !email.includes(searchStr)) return false;
    }

    if (filters.role && log.role !== filters.role) return false;

    if (filters.action) {
      const logAction = formatAction(log.action).toLowerCase();
      if (!logAction.includes(filters.action.toLowerCase())) return false;
    }

    return true;
  });

  const exporterPDF = () => {
    const doc = new jsPDF();
    const dateJour = new Date().toLocaleDateString(lang === 'ar' ? 'ar-TN' : 'fr-FR');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(227, 6, 19);
    doc.text(`OOREDOO - ${t('journal_acces')}`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date d'export : ${dateJour}`, 14, 28);

    const tableColumn = [t('date_heure'), t('utilisateurs'), t('col_role') || 'Role', t('col_action') || 'Action'];
    const tableRows = filteredLogs.map(log => [
      formatDate(log.cree_le),
      getUserName(log),
      getRoleLabel(log.role),
      formatAction(log.action)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [227, 6, 19] },
      styles: { fontSize: 10, cellPadding: 4 }
    });

    doc.save(`Journalisation_Acces_${dateJour.replace(/\//g, '-')}.pdf`);
  };

  const exporterCSV = () => {
    const headers = ['Date et Heure', 'Utilisateur', 'Role', 'Action'];
    const rows = filteredLogs.map(log => {
      const values = [
        formatDate(log.cree_le),
        getUserName(log),
        getRoleLabel(log.role),
        formatAction(log.action)
      ];

      return values.map(value => `"${safeText(value).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = `data:text/csv;charset=utf-8,\uFEFF${headers.join(',')}\n${rows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateJour = new Date().toLocaleDateString(lang === 'ar' ? 'ar-TN' : 'fr-FR').replace(/\//g, '-');
    link.setAttribute('download', `Journalisation_Acces_${dateJour}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exporterExcel = () => {
    const headers = ['Date et Heure', 'Utilisateur', 'Role', 'Action'];
    const rows = filteredLogs.map(log => [
      formatDate(log.cree_le),
      getUserName(log),
      getRoleLabel(log.role),
      formatAction(log.action)
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Journalisation');

    const dateJour = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
    XLSX.writeFile(workbook, `Journalisation_Acces_${dateJour}.xlsx`);
  };

  return (
    <div className="logs-page">
      <div className="logs-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ScrollText size={28} color="#171B60" />
          <h2>{t('journal_acces')}</h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={exporterExcel} className="btn-rouge" style={{ backgroundColor: '#62BB46', borderColor: '#62BB46', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={18} /> {t('export_excel')}
          </button>
          <button onClick={exporterCSV} className="btn-rouge" style={{ backgroundColor: '#FEBD3B', borderColor: '#FEBD3B', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> {t('export_csv')}
          </button>
          <button onClick={exporterPDF} className="btn-rouge" style={{ backgroundColor: '#F26A36', borderColor: '#F26A36', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileDown size={18} /> {t('export_pdf')}
          </button>
        </div>
      </div>

      <div className="card filters-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={20} color="#171B60" /> {t('filtres_avances')}
        </h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>{t('date_debut')} :</label>
            <input type="datetime-local" name="dateDebut" value={filters.dateDebut} onChange={handleFilterChange} />
          </div>
          <div className="filter-group">
            <label>{t('date_fin')} :</label>
            <input type="datetime-local" name="dateFin" value={filters.dateFin} onChange={handleFilterChange} />
          </div>
          <div className="filter-group">
            <label>{t('utilisateurs')} :</label>
            <input type="text" name="utilisateur" placeholder={t('recherche_nom')} value={filters.utilisateur} onChange={handleFilterChange} />
          </div>
          <div className="filter-group">
            <label>{t('col_role') || 'Role'} :</label>
            <select name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">{t('tous_roles')}</option>
              <option value="admin">Admin</option>
              <option value="zone_manager">Zone Manager</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div className="filter-group">
            <label>{t('type_action')} :</label>
            <input type="text" name="action" placeholder="Ex: connexion, creation..." value={filters.action} onChange={handleFilterChange} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="tableau-container">
          <table>
            <thead>
              <tr>
                <th>{t('date_heure')}</th>
                <th>{t('utilisateurs')}</th>
                <th>{t('col_role') || 'Role'}</th>
                <th>{t('col_action') || 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>{formatDate(log.cree_le)}</td>
                  <td>
                    <strong>{getUserName(log)}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>{safeText(log.email, '-')}</div>
                  </td>
                  <td>
                    <span className={`badge badge-role ${getBadgeRoleClass(log.role)}`}>
                      {getRoleLabel(log.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${log.action === 'login' ? 'badge-vert' : (log.action === 'logout' ? 'badge-rouge' : 'badge-bleu')}`}>
                      {formatAction(log.action)}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>{t('aucun_historique')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
