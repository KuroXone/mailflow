import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const orgId = localStorage.getItem('currentOrgId');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (orgId) config.headers['x-org-id'] = orgId;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/refresh`,
          { refreshToken },
        );
        localStorage.setItem('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(err);
  },
);
