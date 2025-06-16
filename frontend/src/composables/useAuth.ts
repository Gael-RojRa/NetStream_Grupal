import { loginToTVDB } from '@/services/authServices';

export async function useAuth(apiKey: string, pin: string) {
  const token = await loginToTVDB(apiKey, pin);
  localStorage.setItem('tvdbToken', token);
}