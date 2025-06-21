import api from './api';
import type { Movie } from '../types/movie';
import type { MovieExtended } from '../types/movieExtended';
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

export async function fetchMovieIdBySlug(slug: string): Promise<number> {
  if (useMediaStore().token === null) {
    const newToken = await login();
    useMediaStore().token = newToken;
  }

  const response = await api.get<MovieExtended>(`movies/slug/${slug}`);
  return response.data.data.id;
}

export async function fetchMovieBySlug(slug: string): Promise<MovieExtended> {
  if (useMediaStore().token === null) {
    const newToken = await login();
    useMediaStore().token = newToken;
  }

  console.log('slugi', slug);
  const id = await fetchMovieIdBySlug(slug);

  const response = await api.get<MovieExtended>(`movies/${id}/extended`);
  return response.data;
}