import apiClient from '../api/client';

const layawayService = {
  // Customer
  getLayaways: () => apiClient.get('/layaways'),
  getLayaway: (uuid) => apiClient.get(`/layaways/${uuid}`),
  createLayaway: (data) => apiClient.post('/layaways', data),
  makePayment: (uuid, data) => apiClient.post(`/layaways/${uuid}/pay`, data),
  getCards: (params = {}) => apiClient.get('/layaway-cards', { params }),

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

  // Transfers
  adminTransferToCard: (uuid) => apiClient.post(`/admin/layaway-cards/transfer-from-product/${uuid}`),
  adminTransferToProduct: (uuid) => apiClient.post(`/admin/products/transfer-from-card/${uuid}`),

  // Cards
  adminGetCards: (params) => apiClient.get('/admin/layaway-cards', { params }),
  adminCreateCard: (data) => apiClient.post('/admin/layaway-cards', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  adminUpdateCard: (uuid, data) => apiClient.post(`/admin/layaway-cards/${uuid}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  adminDeleteCard: (uuid) => apiClient.delete(`/admin/layaway-cards/${uuid}`),

  // Settings
  getTerms: () => apiClient.get('/layaways/settings/terms'),
  adminGetTerms: () => apiClient.get('/admin/settings/layaway-terms'),
  adminSaveTerms: (data) => apiClient.post('/admin/settings/layaway-terms', data),
};

export default layawayService;
export { layawayService };
