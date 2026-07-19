import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // For Sanctum CSRF / Cookies
});

// Request Interceptor: Attach token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('viotor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response ? error.response.status : null;
    const data = error.response ? error.response.data : null;

    if (status === 401) {
      // Clear local auth storage
      localStorage.removeItem('viotor_token');
      localStorage.removeItem('viotor_user');
      
      // Dispatch custom event to notify components (or trigger redirect)
      window.dispatchEvent(new Event('auth_session_expired'));
    }

    const customError = {
      status,
      message: data?.message || error.message || 'An unexpected error occurred.',
      errors: data?.errors || null,
      raw: error,
    };

    return Promise.reject(customError);
  }
);

export default apiClient;
export { API_BASE_URL };
