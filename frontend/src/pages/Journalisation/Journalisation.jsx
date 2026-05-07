import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useLanguage } from '../../context/LanguageContext';
import { ScrollText, FileSpreadsheet, FileText, FileDown, Search } from 'lucide-react';
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
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Erreur recup logs:', err);
    }
  };

  const formatAction = (action) => {
    if (!action) return '-';
    
    // Mapping des actions techniques vers des libellés lisibles
    const lowerAction = action.toLowerCase();
    
    if (lowerAction === 'login') return t('connexion');
    if (lowerAction === 'logout') return t('deconnexion');
    if (lowerAction === 'timeout') return t('action_timeout');
    if (lowerAction.includes('post sur /api/users')) return t('action_create_user');
    if (lowerAction.includes('delete sur /api/users')) return t('action_delete_user');
    if (lowerAction.includes('mise à jour d\'un utilisateur')) return t('action_approve_refuse');
    if (lowerAction.includes('reset-password')) return t('action_reset_password');
    if (lowerAction.includes('approuver')) return t('action_change_status');
    if (lowerAction.includes('import')) return t('action_import');

    
    return action;
  };


  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredLogs = logs.filter(log => {
    if (filters.dateDebut && new Date(log.cree_le) < new Date(filters.dateDebut)) return false;
    if (filters.dateFin && new Date(log.cree_le) > new Date(filters.dateFin)) return false;

    if (filters.utilisateur) {
      const searchStr = filters.utilisateur.toLowerCase();
      const userName = `${log.prenom} ${log.nom}`.toLowerCase();
      if (!userName.includes(searchStr) && !log.email.toLowerCase().includes(searchStr)) return false;
    }

    if (filters.role && log.role !== filters.role) return false;

    if (filters.action) {
      const logAction = log.action === 'login' ? 'connexion' : (log.action === 'logout' ? 'déconnexion' : log.action.toLowerCase());
      if (!logAction.includes(filters.action.toLowerCase())) return false;
    }

    return true;
  });

  const exporterPDF = () => {
    const doc = new jsPDF();
    const dateJour = new Date().toLocaleDateString(lang === 'ar' ? 'ar-TN' : 'fr-FR');

    doc.setFont("helvetica", "bold");
    doc.setTextColor(227, 6, 19); // Rouge Ooredoo
    doc.text(`OOREDOO - ${t('journal_acces')}`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date d'export : ${dateJour}`, 14, 28);

    const tableColumn = [t('date_heure'), t('utilisateurs'), "Rôle", "Action"];
    const tableRows = [];

    filteredLogs.forEach(log => {
      const date = new Date(log.cree_le).toLocaleString(lang === 'ar' ? 'ar-TN' : 'fr-FR');
      const action = formatAction(log.action);
      const user = `${log.prenom} ${log.nom}`;
      tableRows.push([date, user, log.role.replace('_', ' '), action]);
    });

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
    const headers = ["Date et Heure", "Utilisateur", "Rôle", "Action"];

    const rows = filteredLogs.map(log => {
      const date = new Date(log.cree_le).toLocaleString('fr-FR');
      const action = formatAction(log.action);
      const user = `${log.prenom} ${log.nom}`;
      return `"${date}","${user}","${log.role.replace('_', ' ')}","${action}"`;
    });

    // \uFEFF est ajouté pour forcer Excel à lire le fichier en UTF-8 avec accents
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateJour = new Date().toLocaleDateString(lang === 'ar' ? 'ar-TN' : 'fr-FR').replace(/\//g, '-');
    link.setAttribute("download", `Journalisation_Acces_${dateJour}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exporterExcel = () => {
    const headers = ["Date et Heure", "Utilisateur", "Rôle", "Action"];
    const rows = filteredLogs.map(log => {
      const date = new Date(log.cree_le).toLocaleString('fr-FR');
      const action = formatAction(log.action);
      const user = `${log.prenom} ${log.nom}`;
      return [date, user, log.role.replace('_', ' '), action];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Journalisation");

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
            <label>{t('col_role') || "Rôle"} :</label>
            <select name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">{t('tous_roles')}</option>
              <option value="admin">Admin</option>
              <option value="zone_manager">Zone Manager</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div className="filter-group">
            <label>{t('type_action')} :</label>
            <input type="text" name="action" placeholder="Ex: connexion, création..." value={filters.action} onChange={handleFilterChange} />
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
                <th>{t('col_role') || "Rôle"}</th>
                <th>{t('col_action') || "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.cree_le).toLocaleString(lang === 'ar' ? 'ar-TN' : 'fr-FR')}</td>
                  <td>
                    <strong>{log.prenom} {log.nom}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>{log.email}</div>
                  </td>
                  <td><span className={`badge badge-role ${log.role}`}>{log.role.replace('_', ' ')}</span></td>
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
