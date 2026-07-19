import apiClient from '../api/client';

const chatService = {
  getConversations: () => apiClient.get('/messages'),
  getConversation: (uuid) => apiClient.get(`/messages/${uuid}`),
  sendMessage: (data) => {
    // If sending attachments, use multipart form-data
    if (data.attachments && data.attachments.length > 0) {
      const formData = new FormData();
      if (data.body) formData.append('body', data.body);
      data.attachments.forEach((file) => formData.append('attachments[]', file));
      return apiClient.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.post('/messages', data);
  },
};

export default chatService;
export { chatService };
