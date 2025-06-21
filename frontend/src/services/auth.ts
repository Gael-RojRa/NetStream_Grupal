import api from '@/services/api';

export async function login(): Promise<string> {

  const apikey = import.meta.env.VITE_API_KEY;
  const pin = import.meta.env.VITE_API_PIN;

  const response = await api.post('/login', {
    apikey: apikey,
    pin: pin
  });

  return response.data.data.token;
}