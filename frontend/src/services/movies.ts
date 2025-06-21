import api from './api';
import type { Movie } from '../types/movie';
import { useMediaStore } from '@/stores/mediaStore';
import { login } from './auth';


export async function fetchMovies(page: number): Promise<Movie> {
  if (useMediaStore().token === null) {
    const newToken = await login();
    useMediaStore().token = newToken;
  }

  if (!page || page < 1) {
    page = 1;
  }

  const response = await api.get<Movie>(`movies?page=${page}`);
  return response.data;
}

