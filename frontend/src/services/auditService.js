import apiClient from '../api/client';

export const auditService = {
  getLogs: async (params = {}) => {
    const response = await apiClient.get('/admin/audit-logs', { params });
    return response.data;
  },
};
