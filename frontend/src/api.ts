import axios from 'axios';

const surface = import.meta.env.VITE_APP_SURFACE || 'web';
const defaultApiUrl = surface === 'web' ? '/api' : 'http://localhost/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page, avoiding hard reload if possible
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
