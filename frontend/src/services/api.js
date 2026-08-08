import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Strip axios Error wrappers down to a friendly message.
export const getErrorMessage = (err) => {
  const message = err?.response?.data?.message;
  if (message) return message;
  if (err?.response) return `Something went wrong (${err.response.status}). Please try again.`;
  if (err?.request) return 'Unable to reach the server. Please check your connection.';
  return 'Something went wrong. Please try again.';
};

// Intercept 401 responses and notify listeners so the auth context can log out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;