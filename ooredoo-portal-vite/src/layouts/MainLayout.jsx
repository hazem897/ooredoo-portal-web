import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

function MainLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem('sidebar_open') !== 'false';
  });

  const handleToggleSidebar = React.useCallback(() => {
    const newVal = !isSidebarOpen;
    setSidebarOpen(newVal);
    localStorage.setItem('sidebar_open', newVal.toString());
    
    // Pour empêcher le scroll sur mobile quand la sidebar est ouverte
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
    </div>
  );
}

export default MainLayout;
