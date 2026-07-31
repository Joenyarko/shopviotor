import apiClient from '../api/client';

const authService = {
  async register(data) {
    return apiClient.post('/auth/register', data);
  },
  
  async verifyRegistration(data) {
    return apiClient.post('/auth/register/verify', data);
  },
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  submitStudentVerification: (data) => apiClient.post('/auth/submit-student-verification', data),
  verify2Fa: (data) => apiClient.post('/auth/verify-2fa', data),
};

export default authService;
