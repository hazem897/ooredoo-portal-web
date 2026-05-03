import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';

function MainLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(() => {
    // Si on est sur mobile, le menu doit être fermé par défaut
    if (window.innerWidth <= 768) {
      return false;
    }
    return localStorage.getItem('sidebar_open') !== 'false';
  });

  // Fermer automatiquement la sidebar si la taille de l'écran change vers mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const handleToggleSidebar = React.useCallback(() => {
    const newVal = !isSidebarOpen;
    setSidebarOpen(newVal);
    localStorage.setItem('sidebar_open', newVal.toString());
    
    if (newVal) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }, [isSidebarOpen]);

  return (
    <div className="app-layout">
      <Navbar toggleSidebar={handleToggleSidebar} />
      <div className="app-body">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="app-main">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default MainLayout;
