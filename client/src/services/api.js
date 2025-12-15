import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Collections API
export const collectionsAPI = {
  create: (collectionData) => api.post('/collections', collectionData),
  getAll: (params) => api.get('/collections', { params }),
  getById: (id) => api.get(`/collections/${id}`),
  update: (id, updateData) => api.put(`/collections/${id}`, updateData),
  assign: (id, collectorId) => api.put(`/collections/${id}/assign`, { collectorId }),
  cancel: (id) => api.delete(`/collections/${id}`),
  searchByDateRange: (params) => api.get('/collections/search/date-range', { params }),
};

// Routes API
export const routesAPI = {
  getCollectorRoute: (collectorId, date) => api.get(`/routes/collector/${collectorId}`, { params: { date } }),
  assignToRoute: (routeId, collectionId) => api.put(`/routes/${routeId}/assign`, { collectionId }),
  updateStatus: (routeId, collectionId, status) => api.put(`/routes/${routeId}/status`, { collectionId, status }),
  optimize: (routeId) => api.put(`/routes/${routeId}/optimize`),
  getAll: (params) => api.get('/routes', { params }),
  create: (routeData) => api.post('/routes', routeData),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getStatistics: (params) => api.get('/admin/reports/statistics', { params }),
  assignCollection: (collectionId, collectorId, scheduledDate) => 
    api.post('/admin/collections/assign', { collectionId, collectorId, scheduledDate }),
  getDashboard: () => api.get('/admin/dashboard'),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  getHistory: (collectionId) => api.get(`/notifications/history/${collectionId}`),
};

export default api;