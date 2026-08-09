import apiClient from '../api/client';

const layawayService = {
  // Customer
  getLayaways: () => apiClient.get('/layaways'),
  getLayaway: (uuid) => apiClient.get(`/layaways/${uuid}`),
  createLayaway: (data) => apiClient.post('/layaways', data),
  makePayment: (uuid, data) => apiClient.post(`/layaways/${uuid}/pay`, data),

  // Admin
  adminGetDashboard: () => apiClient.get('/admin/layaways/dashboard/stats'),
  adminGetSales: (params = {}) => apiClient.get('/admin/layaways/sales/history', { params }),
  adminGetInventory: (params = {}) => apiClient.get('/admin/layaways/inventory/products', { params }),
  adminToggleInventory: (uuid) => apiClient.post(`/admin/layaways/inventory/products/${uuid}/toggle`),
  adminGetLayaways: (params = {}) => apiClient.get('/admin/layaways', { params }),
  adminCreateLayaway: (data) => apiClient.post('/admin/layaways', data),
  adminGetLayaway: (uuid) => apiClient.get(`/admin/layaways/${uuid}`),
  adminStorePayment: (uuid, data) => apiClient.post(`/admin/layaways/${uuid}/payments`, data),
  adminReversePayment: (uuid, paymentUuid) => apiClient.post(`/admin/layaways/${uuid}/payments/${paymentUuid}/reverse`),
  adminAddBoxes: (uuid, data) => apiClient.post(`/admin/layaways/${uuid}/add-boxes`, data),
  adminRelease: (uuid) => apiClient.post(`/admin/layaways/${uuid}/release`),
  adminCancel: (uuid, reason) => apiClient.post(`/admin/layaways/${uuid}/cancel`, { reason }),

  // Settings
  getTerms: () => apiClient.get('/layaways/settings/terms'),
  adminGetTerms: () => apiClient.get('/admin/settings/layaway-terms'),
  adminSaveTerms: (data) => apiClient.post('/admin/settings/layaway-terms', data),
};

export default layawayService;
export { layawayService };
