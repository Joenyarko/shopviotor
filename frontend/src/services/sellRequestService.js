import apiClient from '../api/client';

const sellRequestService = {
  getSells: (params = {}) => apiClient.get('/sell-requests', { params }),
  getSell: (uuid) => apiClient.get(`/sell-requests/${uuid}`),
  submitSell: (formData) => {
    return apiClient.post('/sell-requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateSell: (uuid, formData) => {
    return apiClient.post(`/sell-requests/${uuid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteSell: (uuid) => apiClient.delete(`/sell-requests/${uuid}`),
  getMessages: (uuid) => apiClient.get(`/sell-requests/${uuid}/messages`),
  sendMessage: (uuid, body) => apiClient.post(`/sell-requests/${uuid}/messages`, { body }),

  // Admin endpoints
  adminGetSells: (params = {}) => apiClient.get('/admin/sell-requests', { params }),
  adminGetSell: (uuid) => apiClient.get(`/admin/sell-requests/${uuid}`),
  adminApproveSell: (uuid, offeredPrice) => apiClient.post(`/admin/sell-requests/${uuid}/approve`, { offered_price: offeredPrice }),
  adminRejectSell: (uuid, reason) => apiClient.post(`/admin/sell-requests/${uuid}/reject`, { reason }),
  adminGetMessages: (uuid) => apiClient.get(`/admin/sell-requests/${uuid}/messages`),
  adminSendMessage: (uuid, body) => apiClient.post(`/admin/sell-requests/${uuid}/messages`, { body }),
  adminToggleChat: (uuid) => apiClient.post(`/admin/sell-requests/${uuid}/toggle-chat`),
};

export default sellRequestService;
export { sellRequestService };
