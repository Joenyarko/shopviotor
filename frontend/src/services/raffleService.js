import apiClient from '../api/client';

const raffleService = {
  // ── PUBLIC ──
  getRaffles: (params = {}) => apiClient.get('/raffles', { params }),
  getRaffle: (uuid) => apiClient.get(`/raffles/${uuid}`),
  getWinners: (params = {}) => apiClient.get('/raffles/winners', { params }),
  buyTickets: (uuid, data) => apiClient.post(`/raffles/${uuid}/purchase-ticket`, data),

  // ── AUTHENTICATED USER ──
  getMyTickets: (params = {}) => apiClient.get('/raffles/my-tickets', { params }),

  // ── ADMIN ──
  adminGetRaffles: (params = {}) => apiClient.get('/admin/raffles', { params }),
  adminCreateRaffle: (data) => apiClient.post('/admin/raffles', data),
  adminUpdateRaffle: (uuid, data) => apiClient.put(`/admin/raffles/${uuid}`, data),
  adminDeleteRaffle: (uuid) => apiClient.delete(`/admin/raffles/${uuid}`),
  adminDrawWinner: (uuid, data) => apiClient.post(`/admin/raffles/${uuid}/draw`, data),
  adminGetWinners: (params = {}) => apiClient.get('/admin/raffles/winners', { params }),
  adminGetTicketHolders: (uuid) => apiClient.get(`/admin/raffles/${uuid}/tickets`),
};

export default raffleService;
export { raffleService };
