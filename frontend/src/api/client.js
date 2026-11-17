import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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

    if (status === 401 || (status === 403 && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/vendor')))) {
      // Clear local auth storage
      localStorage.removeItem('viotor_token');
      localStorage.removeItem('viotor_user');
      sessionStorage.removeItem('admin_2fa_verified');
      
      // Dispatch custom event to notify components
      window.dispatchEvent(new Event('auth_session_expired'));

      // If user is inside admin or vendor portal, proactively redirect to login with notification
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/vendor')) {
        const redirectUrl = `/login?session_expired=1&redirect=${encodeURIComponent(window.location.pathname)}`;
        if (window.location.pathname !== '/login') {
          window.location.href = redirectUrl;
        }
      }
    }

    let message = data?.message || error.message || 'An unexpected error occurred.';

    // If it's a Laravel validation error, extract the first actual error message
    if (status === 422 && data?.errors) {
      const firstErrorKey = Object.keys(data.errors)[0];
      if (firstErrorKey && data.errors[firstErrorKey][0]) {
        message = data.errors[firstErrorKey][0];
      }
    }

    const customError = {
      status,
      message,
      errors: data?.errors || null,
      raw: error,
    };

    return Promise.reject(customError);
  }
);

export default apiClient;
export { API_BASE_URL };
