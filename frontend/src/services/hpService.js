import apiClient from '../api/client';

const hpService = {
  getAgreements: (params = {}) => apiClient.get('/hire-purchases', { params }),
  getAgreement: (uuid) => apiClient.get(`/hire-purchases/${uuid}`),
  createAgreement: (data) => apiClient.post('/hire-purchases', data),
  payInstallment: (uuid, installmentId, data) => {
    return apiClient.post(`/hire-purchases/${uuid}/installments/${installmentId}/pay`, data);
  },
  
  // Admin Methods
  adminGetAgreements: (params = {}) => apiClient.get('/admin/hire-purchases', { params }),
  adminGetAgreement: (uuid) => apiClient.get(`/admin/hire-purchases/${uuid}`),
  adminUpdateStatus: (uuid, status) => apiClient.post(`/admin/hire-purchases/${uuid}/status`, { status }),
  adminConfirmDeposit: (uuid, data = {}) => apiClient.post(`/admin/hire-purchases/${uuid}/confirm-deposit`, data),
  adminConfirmInstallment: (uuid, installmentId, data = {}) => apiClient.post(`/admin/hire-purchases/${uuid}/installments/${installmentId}/confirm-payment`, data),
  adminGetKycApplications: () => apiClient.get('/admin/hire-purchases/applications'),
  adminApproveKycApplication: (userUuid) => apiClient.post(`/admin/hire-purchases/applications/${userUuid}/approve`),
  adminRejectKycApplication: (userUuid, reason) => apiClient.post(`/admin/hire-purchases/applications/${userUuid}/reject`, { reason }),
};

export default hpService;
export { hpService };
