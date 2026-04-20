// frontend/src/utils/api.js
import axios from 'axios';

// Instance axios avec base URL
const api = axios.create({
  baseURL: '/api'
});

// Ajouter le token JWT automatiquement à chaque requête
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si token expiré, rediriger vers login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
