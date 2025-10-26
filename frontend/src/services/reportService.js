import api from './api';

export const reportService = {
  // Generate a new report
  generate: async (reportData) => {
    const response = await api.post('/reports/generate', reportData);
    return response.data;
  },

  // Get all reports for the user
  getAll: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  // Get a single report by ID
  getById: async (reportId) => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  },

  // Update a report
  update: async (reportId, reportData) => {
    const response = await api.put(`/reports/${reportId}`, reportData);
    return response.data;
  },

  // Delete a report
  delete: async (reportId) => {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  },

  // Export report
  export: async (reportId, format) => {
    const response = await api.post(`/reports/${reportId}/export`, { format }, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Upload images for a report
  uploadImages: async (reportId, images) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post(`/reports/${reportId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Analyze images with AI
  analyzeImages: async (images) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post('/reports/analyze-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default reportService;
