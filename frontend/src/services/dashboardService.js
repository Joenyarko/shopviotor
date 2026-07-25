import apiClient from '../api/client';

const dashboardService = {
  getComprehensiveStats: () => apiClient.get('/admin/dashboard/comprehensive-stats'),
};

export default dashboardService;
