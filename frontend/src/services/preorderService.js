import apiClient from '../api/client';

const preorderService = {
  // Customer Methods
  getMyPreOrders: () => apiClient.get('/pre-orders'),
  storePreOrder: (data) => apiClient.post('/pre-orders', data),

  // Admin Methods
  adminGetPreOrders: (params) => apiClient.get('/admin/pre-orders', { params }),
  adminUpdateStatus: (uuid, status) => apiClient.post(`/admin/pre-orders/${uuid}/status`, { status }),
};

export default preorderService;
