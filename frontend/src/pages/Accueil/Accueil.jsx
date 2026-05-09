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
              <img src="/logo1.png" alt="Ooredoo" className="nav-logo" />
            </a>
          </div>
          <nav className="nav-links desktop-only">
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
            <img src="/logo1.png" alt="Ooredoo" style={{ height: '80px', borderRadius: '8px' }} />
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
              <img src="/logo1.png" alt="Ooredoo" className="footer-logo" />
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
              <a href="https://www.facebook.com/OoredooTunisie" target="_blank" rel="noopener noreferrer" className="soc-icon" title="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="https://x.com/ooredootn" target="_blank" rel="noopener noreferrer" className="soc-icon" title="X (Twitter)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://www.linkedin.com/company/ooredoo-tunisie" target="_blank" rel="noopener noreferrer" className="soc-icon" title="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="https://www.instagram.com/ooredootunisie" target="_blank" rel="noopener noreferrer" className="soc-icon" title="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="https://www.pinterest.com/pin/579627414540065878/" target="_blank" rel="noopener noreferrer" className="soc-icon" title="Pinterest">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" /></svg>
              </a>
              <a href="https://www.youtube.com/ooredootn" target="_blank" rel="noopener noreferrer" className="soc-icon" title="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
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
