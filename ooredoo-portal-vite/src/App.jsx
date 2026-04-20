// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts & Guards
import MainLayout from './layouts/MainLayout';
import RouteProtegee from './components/RouteProtegee';
import RouteAdmin from './components/RouteAdmin';

// Pages
import Accueil from './pages/Accueil/Accueil';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Utilisateurs from './pages/Utilisateurs/Utilisateurs';
import Journalisation from './pages/Journalisation/Journalisation';
import Profil from './pages/Profil/Profil';
import Themes from './pages/Themes/Themes';

import './index.css';

function App() {
  React.useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark-mode');
    }
    if (localStorage.getItem('compactMode') === 'true') {
      document.documentElement.classList.add('compact-mode');
    }
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>


          {/* Pages publiques */}
          <Route path="/" element={<Accueil />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Pages protégées */}
          <Route path="/dashboard" element={
            <RouteProtegee>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </RouteProtegee>
          } />

          <Route path="/utilisateurs" element={
            <RouteProtegee>
              <RouteAdmin>
                <MainLayout>
                  <Utilisateurs />
                </MainLayout>
              </RouteAdmin>
            </RouteProtegee>
          } />

          <Route path="/journalisation" element={
            <RouteProtegee>
              <RouteAdmin>
                <MainLayout>
                  <Journalisation />
                </MainLayout>
              </RouteAdmin>
            </RouteProtegee>
          } />

          <Route path="/profil/:id" element={
            <RouteProtegee>
              <MainLayout>
                <Profil />
              </MainLayout>
            </RouteProtegee>
          } />

          <Route path="/parametres" element={
            <RouteProtegee>
              <MainLayout>
                <Themes />
              </MainLayout>
            </RouteProtegee>
          } />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </LanguageProvider>
  );
}

export default App;
