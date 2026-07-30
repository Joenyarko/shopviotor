import apiClient from '../api/client';

const getPopups = () => {
    return apiClient.get('/admin/promo-popups');
};

const getActivePopups = () => {
    return apiClient.get('/promo-popups/active');
};

const createPopup = (formData) => {
    return apiClient.post('/admin/promo-popups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

const updatePopup = (uuid, formData) => {
    return apiClient.post(`/admin/promo-popups/${uuid}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

const deletePopup = (uuid) => {
    return apiClient.delete(`/admin/promo-popups/${uuid}`);
};

export default {
    getPopups,
    getActivePopups,
    createPopup,
    updatePopup,
    deletePopup
};
