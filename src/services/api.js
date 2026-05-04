import axios from 'axios';

const API = axios.create({
  baseURL:"https://hotelbackend-rsrl.onrender.com/api",
  // baseURL:"http://localhost:5000/api/",
  timeout: 10000,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hotelToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hotelToken');
      localStorage.removeItem('hotelUser');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// ── Rooms ─────────────────────────────────────────────────
export const getRooms = (params) => API.get('/rooms', { params });
export const getRoom = (id) => API.get(`/rooms/${id}`);
export const createRoom = (data) => API.post('/rooms', data);
export const updateRoom = (id, data) => API.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);
export const addReview = (id, data) => API.post(`/rooms/${id}/reviews`, data);

// ── Bookings ──────────────────────────────────────────────
export const createBooking = (data) => API.post('/bookings', data);
export const adminCreateBooking = (data) => API.post('/bookings/admin/create', data);
export const getMyBookings = () => API.get('/bookings/my');
export const getAllBookings = () => API.get('/bookings/admin/all');
export const getDashboardStats = () => API.get('/bookings/admin/stats');
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);
export const updateBookingStatus = (id, status) => API.put(`/bookings/${id}/status`, { status });

// ── Users ─────────────────────────────────────────────────
export const getAllUsers = () => API.get('/users');
export const deleteUser = (id) => API.delete(`/users/${id}`);

export default API;
