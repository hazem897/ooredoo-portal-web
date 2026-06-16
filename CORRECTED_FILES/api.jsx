// frontend/src/utils/api.jsx - VERSION CORRIGÉE ET COMPLÈTE
import axios from 'axios';

// ✅ Instance axios avec base URL
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// ✅ Interceptor REQUEST: Ajoute le JWT token automatiquement
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interceptor RESPONSE: Gère les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API ERROR]', error.response?.status, error.response?.data?.message);
    
    if (error.response?.status === 401) {
      console.warn('[API] Token expiré ou invalide - Redirecting to login');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
