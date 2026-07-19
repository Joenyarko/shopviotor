import apiClient from '../api/client';

const orderService = {
  // Pass idempotency key to prevent duplicate order creation on retry
  checkout: (data, idempotencyKey) => apiClient.post('/checkout', data, {
    headers: idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {},
  }),
  verifyPayment: (reference) => apiClient.get(`/payments/verify/${reference}`),
  getOrders: (params = {}) => apiClient.get('/orders', { params }),
  getOrder: (uuid) => apiClient.get(`/orders/${uuid}`),
  cancelOrder: (uuid, reason) => apiClient.post(`/orders/${uuid}/cancel`, { reason }),

  // Admin endpoints
  adminGetOrders: (params = {}) => apiClient.get('/admin/orders', { params }),
  adminGetOrder: (uuid) => apiClient.get(`/admin/orders/${uuid}`),
  adminUpdateStatus: (uuid, status, note = '') => apiClient.put(`/admin/orders/${uuid}/status`, { status, note }),
  adminGetStats: () => apiClient.get('/admin/orders/stats'),
};

export default orderService;
export { orderService };
