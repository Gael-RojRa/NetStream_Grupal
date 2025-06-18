import api from './api';
import type { Serie } from '../types/serie';
import { useMoviesStore } from '@/stores/moviesStore';
import { login } from '@/services/auth';

export async function fetchSeries(page:number): Promise<Serie> {
  
  if (useMoviesStore().token === null) {
    await login()
      .then(token => {
        useMoviesStore().token = token;
      }
    )
      .catch(error => {
        console.error('Login failed:', error);
        throw new Error('Failed to authenticate');
      });
  }
  
  if (page < 1 || !page) {
    page = 1;
  }

  const response = await api.get<Serie>(`series?page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${useMoviesStore().token}`,
      },
    }
  );

  return response.data;

}
