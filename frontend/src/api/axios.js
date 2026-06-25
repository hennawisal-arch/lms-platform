import axios from 'axios';

// In local dev, leave VITE_API_URL unset — Vite's dev server proxies /api,
// /uploads, and /socket.io straight to localhost:5000 (see vite.config.js).
// In production (frontend on Vercel, backend on Render/Railway/etc.), set
// VITE_API_URL to the deployed backend's full origin, e.g.
// https://your-backend.onrender.com
export const API_ORIGIN = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, the token is invalid/expired — clear it so the app falls back to the login screen.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
    }
    return Promise.reject(err);
  }
);

// Resolves a backend-relative path (e.g. a course thumbnail like
// "/uploads/thumbnails/x.png") to a full URL in production.
export const assetUrl = (path) => (path ? `${API_ORIGIN}${path}` : path);

export default api;