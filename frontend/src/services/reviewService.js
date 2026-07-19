import apiClient from '../api/client';

const reviewService = {
  submitReview: (formData) => {
    return apiClient.post('/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default reviewService;
export { reviewService };
