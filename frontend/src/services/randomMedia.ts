import type { SearchResult } from '../types/searchResult';
import { searchMedia } from './search';

export async function getRandomMovies(limit: number = 10): Promise<SearchResult> {
  // Usar una búsqueda con un término aleatorio para obtener películas variadas
  const randomTerms = ['action', 'drama', 'comedy', 'thriller', 'romance', 'sci-fi', 'horror', 'adventure'];
  const randomTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];

  const result = await searchMedia(randomTerm, 'movies', limit)
  return result;
}

export async function getRandomSeries(limit: number = 10): Promise<SearchResult> {
  // Usar una búsqueda con un término aleatorio para obtener series variadas
  const randomTerms = ['drama', 'comedy', 'action', 'thriller', 'romance', 'sci-fi', 'horror', 'adventure'];
  const randomTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];

  const result = await searchMedia(randomTerm, 'series', limit)
  return result;
} 