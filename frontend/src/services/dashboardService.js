import apiClient from '../api/client';

const dashboardService = {
  getComprehensiveStats: (filter = 'all') => apiClient.get(`/admin/dashboard/comprehensive-stats?filter=${filter}`),
};

export default dashboardService;
