import apiClient from '../api/client';

const hpService = {
  getAgreements: (params = {}) => apiClient.get('/hire-purchases', { params }),
  getAgreement: (uuid) => apiClient.get(`/hire-purchases/${uuid}`),
  createAgreement: (data) => apiClient.post('/hire-purchases', data),
  payInstallment: (uuid, installmentId, data) => {
    return apiClient.post(`/hire-purchases/${uuid}/installments/${installmentId}/pay`, data);
  },
};

export default hpService;
export { hpService };
