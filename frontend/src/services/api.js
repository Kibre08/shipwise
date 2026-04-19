import axios from 'axios';

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/shipments',
    withCredentials: true
});

// Interceptor removed - cookies are handled automatically by the browser

export const createShipment = (data) => api.post('/create', data);
export const createSenderShipment = (data) => api.post('/sender/create', data);
export const trackShipment = (id) => api.get(`/track/${id}`);
export const updateShipment = (id, data) => api.patch(`/update/${id}`, data);
export const receiveShipment = (id) => api.patch(`/dispatcher/receive/${id}`);
export const getAllShipments = (page = 1, limit = 10, search = '') => api.get(`/all?page=${page}&limit=${limit}&search=${search}`);
export const getMyShipments = (page = 1, limit = 5) => api.get(`/my-shipments?page=${page}&limit=${limit}`);
export const getCourierTasks = () => api.get('/courier/tasks');
export const assignCourier = (trackingId, data) => api.patch(`/assign/${trackingId}`, data);
export const cancelShipment = (trackingId) => api.delete(`/cancel/${trackingId}`);
export const getAnalytics = () => api.get('/analytics');
export const getAllCouriers = () => axios.get('http://localhost:5000/api/auth/couriers');

export default api;
