// ooredoo-portal-vite/src/services/dashboardService.js
import api from '../utils/api';

const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getTickets: async (filters = {}) => {
    const response = await api.get('/dashboard/tickets', { params: filters });
    return response.data;
  }
};

export default dashboardService;
