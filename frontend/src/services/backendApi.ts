import axios from 'axios';
import { config } from '@/config';

const backendApi = axios.create({
  baseURL: config.backend.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.api.timeout,
});

// Interceptor para agregar el token JWT automáticamente
backendApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('jwt_token');
      // Podrías redireccionar al login aquí si es necesario
    }
    return Promise.reject(error);
  }
);

export default backendApi;
