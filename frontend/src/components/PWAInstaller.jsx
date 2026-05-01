import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';
import './PWAInstaller.css';

export default function PWAInstaller() {
  const { 
    isInstallable, 
    installApp, 
    isStandalone, 
    isIOS, 
    needRefresh, 
    offlineReady, 
    updateApp, 
    closeUpdateToast 
  } = usePWA();
  
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show install banner if not already installed
    if (!isStandalone) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      installApp();
    }
  };

  return (
    <>
      {/* Floating Action Button for Mobile Installation */}
      {!isStandalone && visible && (
        <button className="pwa-fab" onClick={handleInstallClick} title="Installer l'application">
          <i className="fas fa-download"></i>
        </button>
      )}

      {/* Update/Offline Ready Toast */}
      {(needRefresh || offlineReady) && (
        <div className="pwa-toast">
          <div className="pwa-toast-content">
            <div className="pwa-toast-icon">
              {needRefresh ? '🔄' : '✅'}
            </div>
            <div className="pwa-toast-text">
              {needRefresh 
                ? 'Une mise à jour est disponible !' 
                : 'L\'application est prête pour une utilisation hors ligne.'}
            </div>
          </div>
          <div className="pwa-toast-actions">
            {needRefresh && (
              <button className="btn-update" onClick={updateApp}>
                Mettre à jour
              </button>
            )}
            <button className="btn-close-toast" onClick={closeUpdateToast}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* iOS Install Modal */}
      {showIOSModal && (
        <div className="ios-modal-overlay" onClick={() => setShowIOSModal(false)}>
          <div className="ios-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ios-modal-header">
              <h3>Installer l'application</h3>
              <button className="close-ios" onClick={() => setShowIOSModal(false)}>×</button>
            </div>
            <div className="ios-modal-body">
              <div className="ios-step">
                <div className="step-number">1</div>
                <div className="step-text">
                  Cliquez sur le bouton <strong>'Partager'</strong> <i className="fas fa-arrow-up-from-bracket"></i> en bas de votre navigateur Safari.
                </div>
              </div>
              <div className="ios-step">
                <div className="step-number">2</div>
                <div className="step-text">
                  Faites défiler vers le bas et sélectionnez <strong>'Sur l'écran d'accueil'</strong> <i className="fas fa-square-plus"></i>.
                </div>
              </div>
              <div className="ios-step">
                <div className="step-number">3</div>
                <div className="step-text">
                  Cliquez sur <strong>'Ajouter'</strong> en haut à droite pour confirmer.
                </div>
              </div>
            </div>
            <button className="btn-ios-done" onClick={() => setShowIOSModal(false)}>D'accord</button>
          </div>
        </div>
      )}

      {/* Desktop/Android Banner */}
      {!isIOS && isInstallable && visible && !isStandalone && (
        <div className="pwa-banner">
          <div className="pwa-content">
            <div className="pwa-icon">
               <img src="/ooredoo_icon.png" alt="Ooredoo" />
            </div>
            <div className="pwa-text">
               <strong>Application Ooredoo</strong>
               <p>Installez le portail pour une expérience fluide et rapide.</p>
            </div>
            <div className="pwa-actions">
               <button className="btn-install" onClick={installApp}>
                 Installer
               </button>
               <button className="btn-close-banner" onClick={() => setVisible(false)}>×</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
