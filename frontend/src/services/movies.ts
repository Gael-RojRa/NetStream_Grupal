import api from './api';
import type { Movie } from '../types/movie';

export async function fetchMovies(page:number): Promise<Movie> {
  if (page < 1 || !page) {
    page = 1;
  }
  const response = await api.get<Movie>(`movies?page=${page}`);
  return response.data;
}

export async function getImage(imagePath: string): Promise<string> {
  if (!imagePath) {
    return '';
  }
  const response = await api.get<string>(`image?path=${imagePath}`);
  return response.data;
}