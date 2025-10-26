import api from './api';

export const crmService = {
  // Clients
  getClients: async () => {
    const response = await api.get('/crm/clients');
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await api.post('/crm/clients', clientData);
    return response.data;
  },

  updateClient: async (clientId, clientData) => {
    const response = await api.put(`/crm/clients/${clientId}`, clientData);
    return response.data;
  },

  deleteClient: async (clientId) => {
    const response = await api.delete(`/crm/clients/${clientId}`);
    return response.data;
  },

  // Claims
  getClaims: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/crm/claims?${queryParams}`);
    return response.data;
  },

  createClaim: async (claimData) => {
    const response = await api.post('/crm/claims', claimData);
    return response.data;
  },

  updateClaim: async (claimId, claimData) => {
    const response = await api.put(`/crm/claims/${claimId}`, claimData);
    return response.data;
  },

  updateClaimStatus: async (claimId, status, note) => {
    const response = await api.put(`/crm/claims/${claimId}/status`, { status, note });
    return response.data;
  },

  deleteClaim: async (claimId) => {
    const response = await api.delete(`/crm/claims/${claimId}`);
    return response.data;
  },

  // Analytics
  getDashboard: async () => {
    const response = await api.get('/crm/analytics/dashboard');
    return response.data;
  },

  getAnalytics: async (dateRange) => {
    const response = await api.get('/crm/analytics', { params: dateRange });
    return response.data;
  },
};

export default crmService;
