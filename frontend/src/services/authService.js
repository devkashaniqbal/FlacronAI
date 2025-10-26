import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', response.data.user.userId);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', response.data.user.userId);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
    }
  },

  verifyToken: async (token) => {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  },

  getCurrentUser: () => {
    return localStorage.getItem('userId');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export default authService;
