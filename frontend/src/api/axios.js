// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8080",
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;

import axios from 'axios';

const instance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach token from localStorage on every call ────────────────────
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codeforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: normalise errors, but DON'T do hard redirects here ─────────────
// Redirecting inside an interceptor fires before React is mounted and causes
// a blank white screen. AuthContext handles 401 gracefully instead.
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error  ||
      error?.message                 ||
      'An unexpected error occurred';

    // Reject with a plain Error so callers get .message reliably
    return Promise.reject(new Error(message));
  }
);

export default instance;