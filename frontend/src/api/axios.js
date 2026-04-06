import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codeforge_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalise error responses into readable messages
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data   = error?.response?.data;
    const url    = error?.config?.url ?? '';

    console.error(`[API ${status}] ${url}`, data);

    // Extract message — tries Spring Boot shapes first, then FastAPI, then fallback
    const message =
      data?.message                                      ||
      data?.detail                                       ||
      (typeof data?.error === 'string'
        && !['Unauthorized', 'Forbidden'].includes(data.error)
          ? data.error : null)                           ||
      (typeof data === 'string' && data.length < 300
        ? data : null)                                   ||
      STATUS_MESSAGES[status]                            ||
      `Request failed (${status ?? 'network error'})`;

    // For protected endpoints (not auth), clear stale token on 401/403
    // so the user gets sent back to login instead of seeing a cryptic error
    const isAuthEndpoint = url.includes('/auth/');
    if (!isAuthEndpoint && (status === 401 || status === 403)) {
      localStorage.removeItem('codeforge_token');
      delete instance.defaults.headers.common['Authorization'];
      window.location.replace('/login');
      return new Promise(() => {}); // halt — don't reject so nothing downstream runs
    }

    return Promise.reject(new Error(message));
  }
);

const STATUS_MESSAGES = {
  400: 'Invalid request. Please check your input.',
  401: 'Incorrect email or password.',
  403: 'Incorrect email or password.',
  404: 'Resource not found.',
  409: 'An account with this email already exists.',
  500: 'Server error. Please try again later.',
  503: 'Service temporarily unavailable.',
  504: 'Request timed out.',
};

export default instance;