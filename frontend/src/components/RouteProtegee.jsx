import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RouteProtegee({ children }) {
  const { user, chargement } = useAuth();
  if (chargement) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default RouteProtegee;
