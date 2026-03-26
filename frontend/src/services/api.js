import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecostay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecostay_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Hotels API
export const hotelsAPI = {
  getAll: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`),
  create: (data) => api.post('/hotels', data),
  update: (id, data) => api.put(`/hotels/${id}`, data),
  delete: (id) => api.delete(`/hotels/${id}`),
  addReview: (id, data) => api.post(`/hotels/${id}/reviews`, data),
  getMyHotels: () => api.get('/hotels/owner/my-hotels')
};

// Rooms API
export const roomsAPI = {
  getByHotel: (hotelId, params) => api.get(`/rooms/hotel/${hotelId}`, { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  checkAvailability: (data) => api.post('/rooms/check-availability', data)
};

// Bookings API
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getHotelBookings: (hotelId, params) => api.get(`/bookings/hotel/${hotelId}`, { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  getByTicket: (ticket) => api.get(`/bookings/ticket/${ticket}`)
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getHotels: (params) => api.get('/admin/hotels', { params }),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  verifyHotel: (id) => api.put(`/admin/hotels/${id}/verify`),
  unverifyHotel: (id) => api.put(`/admin/hotels/${id}/unverify`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

export default api;
