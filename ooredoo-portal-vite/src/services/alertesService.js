// ooredoo-portal-vite/src/services/alertesService.js
import api from '../utils/api';

const alertesService = {
  // Récupérer toutes les alertes (3 catégories)
  getAlertes: async () => {
    const response = await api.get('/alertes');
    return response.data;
  },

  // Envoyer une relance pour un ticket unique
  envoyerRelance: async (ticketId, typeAlerte, messagePerso = '') => {
    const response = await api.post(`/alertes/${ticketId}/relance`, {
      typeAlerte,
      messagePerso
    });
    return response.data;
  },

  // Envoyer une relance groupée
  envoyerRelanceGroupe: async (ticketIds, typeAlerte, messagePerso = '') => {
    const response = await api.post('/alertes/relance-groupe', {
      ticketIds,
      typeAlerte,
      messagePerso
    });
    return response.data;
  },

  // Mettre à jour le statut gel d'un ticket
  mettreAjourGel: async (ticketId, statut_gel) => {
    const response = await api.put(`/alertes/${ticketId}/statut-gel`, { statut_gel });
    return response.data;
  }
};

export default alertesService;
