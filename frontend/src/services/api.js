import axios from 'axios';
import { auth } from '../config/firebase.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 120000, // 2 minutes for AI generation
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach Firebase token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Fallback to localStorage token
        const token = localStorage.getItem('flac_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Token fetch failed:', err.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors
let isRetrying = false;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    // 401 — clear auth and redirect
    if (response?.status === 401) {
      localStorage.removeItem('flac_token');
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
      return Promise.reject(error);
    }

    // 429 — rate limited, retry once after delay
    if (response?.status === 429 && !isRetrying && !config._retry) {
      isRetrying = true;
      config._retry = true;
      await new Promise(r => setTimeout(r, 2000));
      isRetrying = false;
      return api(config);
    }

    return Promise.reject(error);
  }
);

// Typed API methods
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verify: () => api.post('/auth/verify'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  changePassword: (newPassword) => api.post('/auth/change-password', { newPassword }),
};

export const reportsAPI = {
  generate: (formData) => api.post('/reports/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (p) => console.log(`Upload: ${Math.round((p.loaded / p.total) * 100)}%`),
  }),
  getAll: (params) => api.get('/reports', { params }),
  getOne: (id) => api.get(`/reports/${id}`),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id, permanent = false) => api.delete(`/reports/${id}`, { params: { permanent } }),
  export: (id, data) => api.post(`/reports/${id}/export`, data),
  getDownloadUrl: (id, filename) => `${api.defaults.baseURL}/reports/${id}/download?file=${filename}`,
  download: (id, filename) => api.get(`/reports/${id}/download?file=${filename}`, { responseType: 'blob' }),
  analyzeImages: (formData) => api.post('/reports/analyze-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  aiStatus: () => api.get('/reports/ai-status'),
  addImages: (id, formData) => api.post(`/reports/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadLogo: (formData) => api.post('/users/profile/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteLogo: () => api.delete('/users/profile/logo'),
  getUsage: () => api.get('/users/usage'),
  updateName: (displayName) => api.put('/users/update-name', { displayName }),
  changePassword: (newPassword) => api.put('/users/change-password', { newPassword }),
  createApiKey: (name) => api.post('/users/api-keys', { name }),
  getApiKeys: () => api.get('/users/api-keys'),
  revokeApiKey: (keyId) => api.delete(`/users/api-keys/${keyId}`),
  getKeyUsage: (keyId) => api.get(`/users/api-keys/${keyId}/usage`),
  getApiUsage: () => api.get('/users/api-usage'),
};

export const paymentAPI = {
  createCheckout: (tier) => api.post('/payment/create-checkout-session', { tier }),
  getSubscription: () => api.get('/payment/current-subscription'),
  getInvoices: () => api.get('/payment/invoices'),
  cancelSubscription: () => api.post('/payment/cancel-subscription'),
};

export const crmAPI = {
  // Clients
  getClients: (params) => api.get('/crm/clients', { params }),
  createClient: (data) => api.post('/crm/clients', data),
  getClient: (id) => api.get(`/crm/clients/${id}`),
  updateClient: (id, data) => api.put(`/crm/clients/${id}`, data),
  deleteClient: (id) => api.delete(`/crm/clients/${id}`),
  getClientReports: (id) => api.get(`/crm/clients/${id}/reports`),
  // Appointments
  getAppointments: (params) => api.get('/crm/appointments', { params }),
  createAppointment: (data) => api.post('/crm/appointments', data),
  updateAppointment: (id, data) => api.put(`/crm/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/crm/appointments/${id}`),
  // Claims
  getClaims: (params) => api.get('/crm/claims', { params }),
  createClaim: (data) => api.post('/crm/claims', data),
  getClaim: (id) => api.get(`/crm/claims/${id}`),
  updateClaim: (id, data) => api.put(`/crm/claims/${id}`, data),
  deleteClaim: (id) => api.delete(`/crm/claims/${id}`),
};

export const whiteLabelAPI = {
  getConfig: () => api.get('/white-label/config'),
  updateConfig: (data) => api.put('/white-label/customize', data),
  uploadLogo: (formData) => api.post('/white-label/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPortal: (subdomain) => api.get(`/white-label/portal/${subdomain}`),
  preview: () => api.post('/white-label/preview', {}, { responseType: 'blob' }),
};

export const teamsAPI = {
  getMembers: () => api.get('/teams/members'),
  invite: (email, role) => api.post('/teams/invite', { email, role }),
  updateRole: (memberId, role) => api.put(`/teams/members/${memberId}/role`, { role }),
  remove: (memberId) => api.delete(`/teams/members/${memberId}`),
  getRoles: () => api.get('/teams/roles'),
  acceptInvite: (token) => api.post(`/teams/accept/${token}`),
};

export const salesAPI = {
  contact: (data) => api.post('/sales/contact', data),
  getLeads: (params) => api.get('/sales/leads', { params }),
  updateLead: (id, data) => api.put(`/sales/leads/${id}`, data),
  updateUserTier: (email, tier) => api.put('/sales/admin/update-tier', { email, tier }),
};

export default api;
