import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Accueil.css';

export default function Accueil() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const posSiege = [36.8527, 10.2058]; // Charguia 2
    const posTunisie = [34.0, 9.5];   // Centre Tunisie

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false
      }).setView(posTunisie, 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);

      const redIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #E30613; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker(posSiege, { icon: redIcon }).addTo(mapInstance.current);

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; min-width: 250px;">
          <h4 style="color: #E30613; margin: 0 0 8px 0; font-family: 'Cairo', sans-serif;">${t('siege_ooredoo')}</h4>
          <p style="margin: 4px 0; font-size: 13px;"><b>📍 ${t('adresse')} :</b> Siège Ooredoo, Rue 8003, La Charguia II, Tunis</p>
          <p style="margin: 4px 0; font-size: 13px;"><b>📞 Tél :</b> (+216) 22 11 11 11</p>
          <p style="margin: 4px 0; font-size: 13px;"><b>✉️ ${t('support')} :</b> support.fix@ooredoo.tn</p>
          <div style="margin-top: 10px; border-top: 1.5px solid #E30613; padding-top: 8px; font-weight: bold; color: #333; font-size: 11px; text-transform: uppercase;">
            ${t('direction_cg')}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      const flyToSiege = (duration = 10) => {
        if (mapInstance.current) {
          mapInstance.current.flyTo(posSiege, 16, {
            duration: duration,
            easeLinearity: 0.1
          });
          mapInstance.current.once('moveend', () => {
            marker.openPopup();
          });
        }
      };

      setTimeout(() => flyToSiege(10), 2000);
      mapRef.current._retour = () => flyToSiege(3);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [t]);

  return (
    <div className="accueil">
      {/* HEADER / NAVBAR */}
      <header className={`header-accueil ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="logo-section">
            <a href="#accueil" title="Retour à l'accueil">
              <img src="/ooredoo_logo.png" alt="Ooredoo" className="nav-logo" />
            </a>
          </div>
          <nav className="nav-links">
            <a href="#accueil">Accueil</a>
            <a href="#fonctionnalites">Fonctionnalités</a>
            <a href="#produits">Produits Fix Jdid</a>
            <a href="#contact">Localisation</a>
            <a href="#propos">À propos</a>
          </nav>
          <div className="header-actions-nav">
            <Link to="/login" className="btn-rejoindre">
              <span className="user-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              {t('se_connecter')}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="accueil">
        <div className="hero-contenu">
          <div className="logo-hero">
            <img src="/ooredoo_logo.png" alt="Ooredoo" style={{ height: '80px', borderRadius: '8px' }} />
            <div>
              <p style={{ marginTop: '0', fontSize: '18px' }}>{t('portail_interne')}</p>
            </div>
          </div>
          <h2>{t('bienvenue')}</h2>
          <p className="hero-desc">
            {t('perfs_sla_desc')}
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn-rouge">{t('se_connecter')} →</Link>
          </div>
        </div>
        <div className="hero-deco">
          <div className="cercle c1"></div>
          <div className="cercle c2"></div>
          <div className="cercle c3"></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="fonctionnalites">
        <h3>{t('features')}</h3>
        <div className="features-grille">
          <div className="feature-card">
            <div className="feature-icone">📊</div>
            <h4>Dashboard SLA</h4>
            <p>{t('feature_dash_desc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icone">🗂️</div>
            <h4>{t('tickets')}</h4>
            <p>{t('feature_tickets_desc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icone">👥</div>
            <h4>{t('utilisateurs')}</h4>
            <p>{t('feature_users_desc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icone">🔒</div>
            <h4>{t('securite')}</h4>
            <p>{t('feature_otp_desc')}</p>
          </div>
        </div>
      </section>

      {/* PRODUITS */}
      <section className="produits" id="produits">
        <h3>{t('produits_fix_jdid')}</h3>
        <div className="produits-grille" id="galerie">
          <div className="produit-card outdoor">
            <h4>🏠 Outdoor</h4>
            <p>{t('outdoor_desc')}</p>
            <div className="debits-list">
              <span>10 Mbps</span><span>20 Mbps</span><span>50 Mbps</span>
            </div>
          </div>
          <div className="produit-card indoor">
            <h4>🏢 Indoor</h4>
            <p>{t('indoor_desc')}</p>
            <div className="debits-list">
              <span>20 Mbps</span><span>50 Mbps</span><span>100 Mbps</span>
            </div>
          </div>
          <div className="produit-card pro">
            <h4>💼 Pro</h4>
            <p>{t('pro_desc')}</p>
            <div className="debits-list">
              <span>50 Mbps</span><span>100 Mbps</span><span>200 Mbps</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="map-section" id="contact">
        <h3>{t('localisation_siege')}</h3>
        <p className="map-desc">{t('pbi_desc')}</p>
        <div className="map-container card" style={{ position: 'relative' }}>
          <div ref={mapRef} style={{ width: '100%', height: '450px', borderRadius: '12px' }}></div>
          <button
            className="btn-retour-map"
            onClick={() => mapRef.current && mapRef.current._retour && mapRef.current._retour()}
            title={t('revenir_siege')}
          >
            <span className="btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="accueil-footer" id="propos">
        <div className="footer-grille">
          <div className="footer-col">
            <a href="#accueil" title="Retour en haut">
              <img src="/ooredoo_logo.png" alt="Ooredoo" className="footer-logo" />
            </a>
            <p>Portail Interne de Gestion Fix Jdid – Optimisez vos performances SLA.</p>
          </div>
          <div className="footer-col">
            <h4>{t('support')}</h4>
            <ul>
              <li><Link to="#">{t('assistance')}</Link></li>
              <li><Link to="#">{t('doc_api')}</Link></li>
              <li><Link to="#">{t('etat_services')}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact Officiel</h4>
            <ul>
              <li>📧 support.fix@ooredoo.tn</li>
              <li>📞 (+216) 22 11 11 11</li>
              <li>📍 Siège Ooredoo, Rue 8003, La Charguia II, Tunis</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Suivez-nous</h4>
            <div className="sociaux">
              <span className="soc-icon">FB</span>
              <span className="soc-icon">LN</span>
              <span className="soc-icon">TW</span>
            </div>
          </div>
        </div>
        <div className="footer-bas">
          <p>&copy; {t('copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
