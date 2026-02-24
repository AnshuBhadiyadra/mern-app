import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register/participant', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// Event API
export const eventAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  getTrending: () => api.get('/events/trending'),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  publishEvent: (id) => api.post(`/events/${id}/publish`),
  closeEvent: (id) => api.post(`/events/${id}/close`),
  getOrganizerEvents: () => api.get('/events/organizer/my-events'),
  getEventAnalytics: (id) => api.get(`/events/${id}/analytics`),
};

// Registration API
export const registrationAPI = {
  register: (eventId, data) => api.post(`/registrations/event/${eventId}`, data),
  purchaseMerchandise: (eventId, data) => api.post(`/registrations/merchandise/${eventId}`, data),
  uploadPaymentProof: (registrationId, formData) =>
    api.post(`/registrations/${registrationId}/payment-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  approvePayment: (registrationId) => api.put(`/registrations/${registrationId}/approve-payment`),
  rejectPayment: (registrationId, data) => api.put(`/registrations/${registrationId}/reject-payment`, data),
  getMyRegistrations: () => api.get('/registrations/my-registrations'),
  getEventParticipants: (eventId, params) => api.get(`/registrations/event/${eventId}/participants`, { params }),
  markAttendance: (registrationId, data) => api.post(`/registrations/${registrationId}/mark-attendance`, data),
  exportParticipants: (eventId) => api.get(`/registrations/event/${eventId}/export`, { responseType: 'blob' }),
};

// Admin API
export const adminAPI = {
  createOrganizer: (data) => api.post('/admin/organizers', data),
  getAllOrganizers: () => api.get('/admin/organizers'),
  approveOrganizer: (id) => api.put(`/admin/organizers/${id}/approve`),
  deleteOrganizer: (id, permanent = false) => api.delete(`/admin/organizers/${id}${permanent ? '?permanent=true' : ''}`),
  getPasswordResetRequests: (status) => api.get('/admin/password-resets', { params: status ? { status } : {} }),
  approvePasswordReset: (id, data) => api.put(`/admin/password-resets/${id}/approve`, data),
  rejectPasswordReset: (id, data) => api.put(`/admin/password-resets/${id}/reject`, data),
  getStats: () => api.get('/admin/stats'),
};

// Participant API
export const participantAPI = {
  updateOnboarding: (data) => api.put('/participants/onboarding', data),
  skipOnboarding: () => api.post('/participants/skip-onboarding'),
  updateProfile: (data) => api.put('/participants/profile', data),
  getProfile: () => api.get('/participants/profile'),
  toggleFollow: (organizerId) => api.post(`/participants/follow/${organizerId}`),
  getOrganizers: () => api.get('/participants/organizers'),
  getOrganizerDetail: (id) => api.get(`/participants/organizers/${id}`),
};

// Organizer API
export const organizerAPI = {
  updateProfile: (data) => api.put('/organizers/profile', data),
  getProfile: () => api.get('/organizers/profile'),
  requestPasswordReset: (data) => api.post('/organizers/request-password-reset', data),
  getPasswordResetHistory: () => api.get('/organizers/password-reset-history'),
};

// Discussion API
export const discussionAPI = {
  getMessages: (eventId, params) => api.get(`/discussions/${eventId}`, { params }),
  postMessage: (eventId, data) => api.post(`/discussions/${eventId}`, data),
  togglePin: (messageId) => api.put(`/discussions/${messageId}/pin`),
  deleteMessage: (messageId) => api.delete(`/discussions/${messageId}`),
  reactToMessage: (messageId, data) => api.post(`/discussions/${messageId}/react`, data),
};

export default api;
