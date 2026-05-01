import { useState, useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  // Register Service Worker and handle updates
  const updateServiceWorker = registerSW({
    onNeedRefresh() {
      setNeedRefresh(true);
      console.log('PWA: New content available, please refresh.');
    },
    onOfflineReady() {
      setOfflineReady(true);
      console.log('PWA: App is ready for offline use.');
    },
  });

  useEffect(() => {
    // Check if already in standalone mode (installed)
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(checkStandalone);

    // Detect iOS
    const checkIOS = [
      'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'
    ].includes(navigator.platform)
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    || (navigator.maxTouchPoints > 0 && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome"));
    
    setIsIOS(checkIOS);

    const handleBeforeInstallPrompt = (e) => {
      // Prevent default prompt
      e.preventDefault();
      // Store event
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('PWA: beforeinstallprompt captured');
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      console.log('PWA: Application installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: User choice: ${outcome}`);
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const updateApp = () => {
    updateServiceWorker(true);
  };

  const closeUpdateToast = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return { 
    isInstallable, 
    installApp, 
    isStandalone, 
    isIOS, 
    needRefresh, 
    offlineReady, 
    updateApp, 
    closeUpdateToast 
  };
}
