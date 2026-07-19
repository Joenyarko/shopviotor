import apiClient from '../api/client';

const wishlistService = {
  getWishlist: (params = {}) => apiClient.get('/wishlist', { params }),
  toggleWishlist: (productId) => apiClient.post(`/wishlist/toggle/${productId}`),
};

export default wishlistService;
export { wishlistService };
