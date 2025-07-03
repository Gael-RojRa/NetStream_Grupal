import api from '@/services/api';
import { backendLogin, type LoginCredentials } from '@/services/backendService';

// Función original para obtener token de la API externa (TVDB)
export async function login(): Promise<string> {
  const apikey = import.meta.env.VITE_API_KEY;
  const pin = import.meta.env.VITE_API_PIN;

  const response = await api.post('/login', {
    apikey: apikey,
    pin: pin
  });

  return response.data.data.token;
}

// Nueva función para login del backend
export async function loginBackend(credentials: LoginCredentials): Promise<string> {
  const response = await backendLogin(credentials);
  return response.token;
}