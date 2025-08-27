import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL;

export const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});
export const aiInstance = axios.create({
  baseURL: AI_API_BASE_URL,
  withCredentials: true,
  timeout: 60000,
});

const refreshInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

const attachAuth = (client: typeof instance) => {
  client.interceptors.request.use((config) => {
    if (config.url && config.url !== '/auth/refresh') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      const { data } = await refreshInstance.post('/auth/refresh');
      localStorage.setItem('accessToken', data.accessToken);

      originalRequest.headers = {
        ...(originalRequest.headers || {}),
        Authorization: `Bearer ${data.accessToken}`,
      };
      return instance(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('accessToken');
      window.location.replace('/login');
      return Promise.reject(refreshError);
    }
  },
);

attachAuth(instance);
attachAuth(aiInstance);
