import type { SearchResult } from './search';
import { searchMedia } from './search';

export async function getRandomMovies(limit: number = 30): Promise<SearchResult> {
  // Usar una búsqueda con un término aleatorio para obtener películas variadas
  const randomTerms = ['action', 'drama', 'comedy', 'thriller', 'romance', 'sci-fi', 'horror', 'adventure'];
  const randomTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];

  const reseult = await searchMedia(randomTerm, 'movie', limit)
  return reseult;
}

export async function getRandomSeries(limit: number = 30): Promise<SearchResult> {
  // Usar una búsqueda con un término aleatorio para obtener series variadas
  const randomTerms = ['drama', 'comedy', 'action', 'thriller', 'romance', 'sci-fi', 'horror', 'adventure'];
  const randomTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];

  const reseult = await searchMedia(randomTerm, 'series', limit)
  return reseult;
} 