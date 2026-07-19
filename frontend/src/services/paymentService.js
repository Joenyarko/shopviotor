import apiClient from '../api/client';

const paymentService = {
  getPayments: (params = {}) => apiClient.get('/payments', { params }),
  getPayment: (uuid) => apiClient.get(`/payments/${uuid}`),
  verifyPayment: (reference) => apiClient.get(`/payments/verify/${reference}`),
};

export default paymentService;
export { paymentService };
