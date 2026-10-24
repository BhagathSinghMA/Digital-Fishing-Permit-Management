import axios from 'axios';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8082';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically attach Auth Bearer Token and Harbour Port Header
apiClient.interceptors.request.use((config) => {
  const userJson = localStorage.getItem('tn_fisher_auth_user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      if (user.assignedHarbour) {
        config.headers['X-Harbour-Port'] = user.assignedHarbour;
      }
    } catch {
      // Ignore json parse error
    }
  }
  return config;
});

export default apiClient;
