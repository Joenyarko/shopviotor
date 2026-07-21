import apiClient from '../api/client';

export const bannerService = {
  // Public
  getBanners: (params = {}) => apiClient.get('/banners', { params }),

  // Admin
  adminGetBanners: (params = {}) => apiClient.get('/admin/banners', { params }),
  adminCreateBanner: (data) => apiClient.post('/admin/banners', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  adminUpdateBanner: (id, data) => {
    // When updating with FormData, sometimes we need to use POST and method spoofing.
    // We append _method=PUT to the formData.
    data.append('_method', 'PUT');
    return apiClient.post(`/admin/banners/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  adminDeleteBanner: (id) => apiClient.delete(`/admin/banners/${id}`),
};

export default bannerService;
