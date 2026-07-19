import apiClient from '../api/client';

const addressService = {
  getAddresses: () => apiClient.get('/addresses'),
  createAddress: (data) => apiClient.post('/addresses', data),
  updateAddress: (id, data) => apiClient.put(`/addresses/${id}`, data),
  deleteAddress: (id) => apiClient.delete(`/addresses/${id}`),
};

export default addressService;
export { addressService };
