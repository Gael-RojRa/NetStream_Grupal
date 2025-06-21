import axios from 'axios';
import { useMediaStore } from '@/stores/mediaStore';

const api = axios.create({
  baseURL: import.meta.env.DEV 
    ? '/api' // En desarrollo usa el proxy
    : 'https://api4.thetvdb.com/v4', // En producción usa la API directa
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useMediaStore().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;