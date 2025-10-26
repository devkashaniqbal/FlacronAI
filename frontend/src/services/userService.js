import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  getUsage: async () => {
    const response = await api.get('/users/usage');
    return response.data;
  },

  upgrade: async (tier) => {
    const response = await api.post('/users/upgrade', { tier });
    return response.data;
  },
};

export default userService;
