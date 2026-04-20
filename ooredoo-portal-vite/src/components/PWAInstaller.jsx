import React from 'react';
import { usePWA } from '../hooks/usePWA';
import './PWAInstaller.css';

export default function PWAInstaller() {
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) return null;

  return (
    <div className="pwa-banner">
      <div className="pwa-content">
        <div className="pwa-icon">
           <img src="/ooredoo_icon.png" alt="Ooredoo" />
        </div>
        <div className="pwa-text">
          <strong>Installer l'application</strong>
          <p>Accédez plus rapidement au portail Ooredoo depuis votre écran d'accueil.</p>
        </div>
        <button className="btn-install" onClick={installApp}>
          Installer
        </button>
      </div>
    </div>
  );
}
