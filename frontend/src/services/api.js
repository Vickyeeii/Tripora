import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Call refresh endpoint directly to avoid interceptor loop
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/auth/refresh`,
            { refresh_token: refreshToken }
          );

          const { access_token } = response.data;

          if (access_token) {
            // Update token
            localStorage.setItem('access_token', access_token);

            // Update Authorization header for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            // Retry original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // If refresh fails, we must Logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_role');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, just logout
        const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/register';
        if (!isLoginPage) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_role');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/tourist/signup', data),
  registerGuide: (data) => api.post('/auth/guide/signup', data),
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    window.location.href = '/login';
  }
};

export const dashboardAPI = {
  getTouristDashboard: () => api.get('/dashboard/tourist'),
  getGuideDashboard: () => api.get('/dashboard/guide'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getMyBookings: () => api.get('/bookings/tourist/my-bookings'),
};

export const paymentsAPI = {
  create: (data) => api.post('/payments/', data),
  getStatus: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  getAll: () => api.get('/payments/'),
  markPaid: (id) => api.patch(`/payments/${id}/mark-paid`),
  markFailed: (id) => api.patch(`/payments/${id}/mark-failed`),
};

export const usersAPI = {
  getMyProfile: () => api.get('/users/me'),
  updateMyProfile: (data) => api.put('/users/me', data),
  getPendingGuides: () => api.get('/users/guides/pending'),
  approveGuide: (guideId, approve) => api.put(`/users/guides/${guideId}/approval`, { approve }),
};

export const heritageAPI = {
  getAll: () => api.get('/heritage/'),
  getById: (id) => api.get(`/heritage/${id}`),
  create: (data) => api.post('/heritage/', data),
  update: (id, data) => api.put(`/heritage/${id}`, data),
  approve: (id) => api.patch(`/heritage/${id}/approve`),
  disable: (id) => api.patch(`/heritage/${id}/disable`),
  delete: (id) => api.patch(`/heritage/${id}/delete`),
  addPhoto: (id, imageUrl) => api.post(`/heritage/${id}/photos`, { image_url: imageUrl }),
  deletePhoto: (heritageId, photoId) => api.delete(`/heritage/${heritageId}/photos/${photoId}`),
  addRule: (id, ruleText) => api.post(`/heritage/${id}/rules`, { rule_text: ruleText }),
  generateQR: (id) => api.post(`/heritage/${id}/qr`),
};

export const eventsAPI = {
  getToday: () => api.get('/events/today'),
  getTomorrow: () => api.get('/events/tomorrow'),
  getByHeritage: (heritageId) => api.get(`/events/?heritage_id=${heritageId}`),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events/', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  cancel: (id) => api.patch(`/events/${id}/cancel`),
  disable: (id) => api.patch(`/events/${id}/disable`),
  delete: (id) => api.patch(`/events/${id}/delete`),
};

export const bookingsAPI = {
  createPublic: (data) => api.post('/bookings/', data),
  createTourist: (data) => api.post('/bookings/tourist', data),
  createGuide: (data) => api.post('/bookings/guide', data),
  track: (reference) => api.get(`/bookings/track?reference=${reference}`),
  getAll: () => api.get('/bookings/'),
  getTouristBookings: () => api.get('/bookings/tourist/my-bookings'),
  getGuideBookings: () => api.get('/bookings/my-heritage'),
  confirm: (id) => api.patch(`/bookings/${id}/confirm`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
};

export const notificationsAPI = {
  getGuideNotifications: () => api.get('/notifications/guide'),
  getAdminNotifications: () => api.get('/notifications/admin'),
  getTouristNotifications: () => api.get('/notifications/tourist'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
};

export const feedbacksAPI = {
  getHeritageFeedbacks: (id) => api.get(`/feedbacks/heritage/${id}`),
  getEventFeedbacks: (id) => api.get(`/feedbacks/event/${id}`),
  createTourist: (data) => api.post('/feedbacks/tourist', data),
  createGuest: (data) => api.post('/feedbacks/', data),
  getMyFeedbacks: () => api.get('/feedbacks/my'),
  getAll: () => api.get('/feedbacks/'),
  approve: (id) => api.patch(`/feedbacks/${id}/approve`),
  hide: (id) => api.patch(`/feedbacks/${id}/hide`),
};

export const complaintsAPI = {
  createTourist: (data) => api.post('/complaints/tourist', data),
  createGuest: (data) => api.post('/complaints/', data),
  getMyComplaints: () => api.get('/complaints/my'),
  getGuideComplaints: () => api.get('/complaints/guide/my-heritage'),
  track: (reference) => api.get(`/complaints/track?reference=${reference}`),
  getAll: () => api.get('/complaints/'),
  updateStatus: (id, status) => api.patch(`/complaints/${id}/status`, { status }),
  reply: (id, reply) => api.patch(`/complaints/${id}/reply`, { admin_reply: reply }),
};

export default api;
