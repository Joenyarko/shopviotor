import apiClient from '../api/client';

const productService = {
  getProducts: (params = {}) => apiClient.get('/products', { params }),
  getProduct: (uuid) => apiClient.get(`/products/${uuid}`),
  getRelatedProducts: (uuid) => apiClient.get(`/products/${uuid}/related`),
  searchProducts: (q, params = {}) => apiClient.get('/products/search', { params: { q, ...params } }),
  getFeaturedProducts: () => apiClient.get('/products/featured'),
  getCategories: () => apiClient.get('/categories'),
  getCategory: (slug) => apiClient.get(`/categories/${slug}`),
  getBrands: () => apiClient.get('/brands'),
  getBrand: (slug) => apiClient.get(`/brands/${slug}`),

  // Admin endpoints
  adminGetProducts: (params = {}) => apiClient.get('/admin/products', { params }),
  adminGetProduct: (uuid) => apiClient.get(`/admin/products/${uuid}`),
  adminCreateProduct: (formData) => {
    return apiClient.post('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  adminUpdateProduct: (uuid, formData) => {
    // Laravel PUT request with multipart form-data needs _method override
    if (formData instanceof FormData) {
      formData.append('_method', 'PUT');
      return apiClient.post(`/admin/products/${uuid}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return apiClient.put(`/admin/products/${uuid}`, formData);
  },
  adminDeleteProduct: (uuid) => apiClient.delete(`/admin/products/${uuid}`),

  // Admin Category endpoints
  adminGetCategories: (params = {}) => apiClient.get('/admin/categories', { params }),
  adminCreateCategory: (data) => apiClient.post('/admin/categories', data),
  adminUpdateCategory: (id, data) => apiClient.put(`/admin/categories/${id}`, data),
  adminDeleteCategory: (id) => apiClient.delete(`/admin/categories/${id}`),
};

export default productService;
export { productService };
