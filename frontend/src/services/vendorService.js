import apiClient from '../api/client';

const vendorService = {
  // Store management
  applyForStore: (formData) => apiClient.post('/stores/apply', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyStore: () => apiClient.get('/stores/my-store'),
  updateMyStore: (formData) => apiClient.post('/stores/my-store/update', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Public stores
  getStores: (params = {}) => apiClient.get('/stores', { params }),
  getStore: (slug) => apiClient.get(`/stores/${slug}`),

  // Vendor dashboard & products
  getDashboard: () => apiClient.get('/vendor/dashboard'),
  getProducts: (params = {}) => apiClient.get('/vendor/products', { params }),
  createProduct: (formData) => apiClient.post('/vendor/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (uuid, formData) => apiClient.post(`/vendor/products/${uuid}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (uuid) => apiClient.delete(`/vendor/products/${uuid}`),

  // Vendor orders
  getOrders: (params = {}) => apiClient.get('/vendor/orders', { params }),
  getOrder: (uuid) => apiClient.get(`/vendor/orders/${uuid}`),
  updateOrderStatus: (uuid, status, note = null) => apiClient.post(`/vendor/orders/${uuid}/status`, { status, note }),

  // Vendor Wallet & Payouts
  getWallet: () => apiClient.get('/vendor/wallet'),
  getWalletTransactions: (params = {}) => apiClient.get('/vendor/wallet/transactions', { params }),
  getPayouts: (params = {}) => apiClient.get('/vendor/payouts', { params }),
  requestPayout: (data) => apiClient.post('/vendor/payouts', data),

  // Admin
  adminGetStores: (params = {}) => apiClient.get('/admin/stores', { params }),
  adminApproveStore: (uuid) => apiClient.post(`/admin/stores/${uuid}/approve`),
  adminSuspendStore: (uuid) => apiClient.post(`/admin/stores/${uuid}/suspend`),
  adminRestoreStore: (uuid) => apiClient.post(`/admin/stores/${uuid}/restore`),
  adminVerifyStore: (uuid) => apiClient.post(`/admin/stores/${uuid}/verify`),
  adminUpdateCommission: (uuid, rate) => apiClient.post(`/admin/stores/${uuid}/commission`, { commission_rate: rate }),
  adminUpdatePermissions: (uuid, permissions) => apiClient.post(`/admin/stores/${uuid}/permissions`, permissions),
  
  // Admin Payouts
  adminGetPayouts: (params = {}) => apiClient.get('/admin/payouts', { params }),
  adminProcessPayout: (uuid, data) => apiClient.post(`/admin/payouts/${uuid}/process`, data),
};

export default vendorService;
export { vendorService };
