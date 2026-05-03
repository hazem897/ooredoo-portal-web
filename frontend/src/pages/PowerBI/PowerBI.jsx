import React from 'react';
import { Link } from 'react-router-dom';

export default function PowerBIPublic() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f6f9' }}>
      <header style={{ 
        height: '64px', 
        backgroundColor: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        borderBottom: '3px solid #E30613',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/ooredoo_logo.png" alt="Ooredoo" style={{ height: '40px' }} />
          <strong style={{ color: '#E30613', fontFamily: 'Cairo, sans-serif' }}>Rapport Public</strong>
        </div>
        <Link to="/login" style={{
          textDecoration: 'none',
          backgroundColor: '#E30613',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          Connexion Espace Interne
        </Link>
      </header>
      
      <main style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => window.open("https://app.powerbi.com/groups/me/reports/d86779cf-0211-440f-87c4-588a5a1c6dc9/01e8f4606d1776d4bd27?experience=power-bi", "_blank")}
            style={{
              backgroundColor: '#E30613',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              fontSize: '16px'
            }}
          >
            📊 Ouvrir le Dashboard Interactif (Plein Écran)
          </button>
        </div>
        
        <div style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <iframe
            title="Ooredoo Power BI"
            width="100%" height="100%"
            src="https://app.powerbi.com/reportEmbed?reportId=d86779cf-0211-440f-87c4-588a5a1c6dc9&autoAuth=true"
            frameBorder="0" allowFullScreen={true}
          ></iframe>
        </div>
      </main>
    </div>
  );
}
