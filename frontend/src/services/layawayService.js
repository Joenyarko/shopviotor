import apiClient from '../api/client';

const layawayService = {
  // Customer
  getLayaways: () => apiClient.get('/layaways'),
  getLayaway: (uuid) => apiClient.get(`/layaways/${uuid}`),
  createLayaway: (data) => apiClient.post('/layaways', data),
  makePayment: (uuid, data) => apiClient.post(`/layaways/${uuid}/pay`, data),

  // Admin
  adminGetLayaways: (params = {}) => apiClient.get('/admin/layaways', { params }),
  adminGetLayaway: (uuid) => apiClient.get(`/admin/layaways/${uuid}`),
  adminRelease: (uuid) => apiClient.post(`/admin/layaways/${uuid}/release`),
  adminCancel: (uuid, reason) => apiClient.post(`/admin/layaways/${uuid}/cancel`, { reason }),
};

export default layawayService;
export { layawayService };
