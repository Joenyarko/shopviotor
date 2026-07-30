import apiClient from '../api/client';

const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  submitStudentVerification: (data) => apiClient.post('/auth/submit-student-verification', data),
  verify2Fa: (data) => apiClient.post('/auth/verify-2fa', data),
};

export default authService;
