import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

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

const attachAuth = (client: AxiosInstance) => {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.url && config.url !== '/auth/refresh') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const h = config.headers as any;
        if (h && typeof h.set === 'function') {
          h.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers = (config.headers || {}) as any;
          (config.headers as any)['Authorization'] = `Bearer ${token}`;
        }
      }
    }
    return config;
  });
};

const attach401Refresh = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config || {};
      const status = error.response?.status;

      if (status !== 401 || (originalRequest as any)._retry) {
        return Promise.reject(error);
      }
      (originalRequest as any)._retry = true;

      try {
        // 백엔드는 refresh token을 쿠키에서 자동으로 읽으므로 별도 전송 불필요
        const { data } = await refreshInstance.post('/auth/refresh');
        const newToken = data?.data?.accessToken;
        if (!newToken) {
          throw new Error('No access token in refresh response');
        }

        localStorage.setItem('accessToken', newToken);

        const h = originalRequest.headers as any;
        if (h && typeof h.set === 'function') {
          h.set('Authorization', `Bearer ${newToken}`);
        } else {
          originalRequest.headers = (originalRequest.headers || {}) as any;
          (originalRequest.headers as any)['Authorization'] = `Bearer ${newToken}`;
        }

        return client(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.replace('/login');
        return Promise.reject(refreshError);
      }
    },
  );
};

attachAuth(instance);
attachAuth(aiInstance);
attach401Refresh(instance);
attach401Refresh(aiInstance);
