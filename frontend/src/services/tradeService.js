import apiClient from '../api/client';

const tradeService = {
  getTrades: (params = {}) => apiClient.get('/trade-requests', { params }),
  getTrade: (uuid) => apiClient.get(`/trade-requests/${uuid}`),
  submitTrade: (formData) => {
    return apiClient.post('/trade-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  acceptTradeValuation: (uuid) => apiClient.post(`/trade-requests/${uuid}/accept`),

  // Admin endpoints
  adminGetTrades: (params = {}) => apiClient.get('/admin/trade-requests', { params }),
  adminGetTrade: (uuid) => apiClient.get(`/admin/trade-requests/${uuid}`),
  adminValuateTrade: (uuid, data) => apiClient.post(`/admin/trade-requests/${uuid}/value`, data),
  adminRejectTrade: (uuid, reason) => apiClient.post(`/admin/trade-requests/${uuid}/reject`, { reason }),
};

export default tradeService;
export { tradeService };
